const fs = require('fs');
const path = require('path');

const DEFAULT_DB_PATH = path.join(__dirname, '../../data/data.db');
const SCHEMA_PATH = path.join(__dirname, 'schema.sql');

// 实际生效的数据库路径（openDatabase 成功后回填）
let DB_PATH = DEFAULT_DB_PATH;

// ===== 驱动选择 =====
// 按优先级挑一个能用的 SQLite 实现，对上层 API 保持一致：
//   1. better-sqlite3      —— 本地原生实现，性能最好
//   2. node-sqlite3-wasm   —— 纯 JS 实现，零编译依赖
//   3. node:sqlite         —— Node 内置，零依赖
// 关键背景：云端沙箱既下载不到 better-sqlite3 的预编译二进制（GitHub 不可达），
// 也没有 node-gyp 编译工具链，所以必须有后两级兜底。
// node:sqlite 排在最后是因为它在部分 Node 22.x 运行时上出现过「session 写入成功、
// 按 token 回查却取不到」的行为差异（本地无法复现），只作最终兜底。
// 环境变量 SQLITE_DRIVER=native|wasm|node 可强制指定，便于本地复现各环境。
function loadDriver() {
  const forced = (process.env.SQLITE_DRIVER || '').toLowerCase();

  const tryNative = () => {
    const Database = require('better-sqlite3');
    return { Database, driver: 'better-sqlite3' };
  };
  const tryWasm = () => {
    const { Database } = require('node-sqlite3-wasm');
    return { Database, driver: 'node-sqlite3-wasm' };
  };
  const tryBuiltin = () => {
    const { DatabaseSync } = require('node:sqlite');
    return { Database: DatabaseSync, driver: 'node:sqlite' };
  };

  const candidates = [
    ['native', tryNative],
    ['wasm', tryWasm],
    ['node', tryBuiltin],
  ];

  const chosen = forced ? candidates.filter(([name]) => name === forced) : candidates;
  if (forced && chosen.length === 0) {
    throw new Error(`未知的 SQLITE_DRIVER=${forced}，可选 native / wasm / node`);
  }

  const failures = [];
  for (const [name, loader] of chosen) {
    try {
      return loader();
    } catch (err) {
      failures.push(`${name}: ${String(err.message).split('\n')[0]}`);
    }
  }
  throw new Error(`没有可用的 SQLite 驱动 —— ${failures.join(' | ')}`);
}

const { Database: DbClass, driver: DRIVER } = loadDriver();

/**
 * 抹平各驱动的 API 差异，对上层保持 better-sqlite3 的调用方式不变：
 *  - pragma()      : 仅 better-sqlite3 有，其余用 exec('PRAGMA ...') 等价实现
 *  - transaction() : 同上，其余用 BEGIN/COMMIT/ROLLBACK 手工包裹
 *  - 参数传递      : 纯 JS 驱动只认数组/对象/单值，传展开参数时它只取第一个、
 *                    其余静默变 NULL（不报错！）。这里统一归一化。
 */
function adapt(db) {
  if (typeof db.pragma !== 'function') {
    db.pragma = (statement) => db.exec(`PRAGMA ${statement}`);
  }

  if (typeof db.transaction !== 'function') {
    db.transaction = (fn) => (...args) => {
      db.exec('BEGIN');
      try {
        const result = fn(...args);
        db.exec('COMMIT');
        return result;
      } catch (e) {
        try {
          db.exec('ROLLBACK');
        } catch (_) {
          /* 回滚失败时保留原始错误 */
        }
        throw e;
      }
    };
  }

  if (DRIVER === 'node-sqlite3-wasm') {
    const rawPrepare = db.prepare.bind(db);
    db.prepare = (sql) => {
      const stmt = rawPrepare(sql);
      const call = (name) => (...args) =>
        args.length === 0
          ? stmt[name]()
          : stmt[name](args.length === 1 ? args[0] : args);
      return new Proxy(stmt, {
        get(target, prop) {
          if (prop === 'run' || prop === 'get' || prop === 'all') {
            return call(prop);
          }
          const value = target[prop];
          return typeof value === 'function' ? value.bind(target) : value;
        },
      });
    };
  }

  return db;
}

/**
 * 候选数据库位置。云沙箱的目录结构/权限与本地不完全一致，可能出现
 * 「能建目录、能写文件，但驱动打不开该路径」的情况，因此逐级降级尝试：
 * 常规位置 -> 按 cwd 拼 -> cwd 下的裸文件名 -> 内存库（保证服务可用）。
 */
function dbCandidates() {
  return [
    DEFAULT_DB_PATH,
    path.join(process.cwd(), 'backend/data/data.db'),
    path.join(process.cwd(), 'data.db'),
    ':memory:',
  ];
}

/**
 * 打开数据库：逐候选尝试，并记录每个候选失败的原因（供 /api/health 诊断）。
 * 遇到纯 JS 驱动残留的锁目录会先清理再试一次 —— node-sqlite3-wasm 用
 * <db>.lock 目录模拟跨进程锁，进程被强杀时该目录不会自动清理。
 */
function openDatabase() {
  const attempts = [];
  const seen = new Set();

  for (const candidatePath of dbCandidates()) {
    if (seen.has(candidatePath)) continue;
    seen.add(candidatePath);

    const isMemory = candidatePath === ':memory:';

    // 确保目录存在
    let dirReady = true;
    let dirError = null;
    if (!isMemory) {
      const dir = path.dirname(candidatePath);
      try {
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      } catch (e) {
        dirReady = false;
        dirError = e.message;
      }
    }

    const tryOpen = () => {
      const db = new DbClass(candidatePath);
      db.exec('SELECT 1'); // 触发真正的打开动作：打不开只有到这一步才暴露
      return db;
    };

    if (!dirReady) {
      attempts.push({ path: candidatePath, ok: false, error: `目录创建失败: ${dirError}` });
      continue;
    }

    try {
      const db = tryOpen();
      attempts.push({ path: candidatePath, ok: true });
      return { db, path: candidatePath, attempts };
    } catch (err) {
      const message = String(err.message);
      const lockDir = `${candidatePath}.lock`;

      // 残留锁目录优先自愈
      if (DRIVER === 'node-sqlite3-wasm' && /locked|readonly|unable to open/i.test(message) && fs.existsSync(lockDir)) {
        try {
          fs.rmSync(lockDir, { recursive: true, force: true });
          const db = tryOpen();
          attempts.push({ path: candidatePath, ok: true, recovered: '清理残留锁目录后成功' });
          return { db, path: candidatePath, attempts };
        } catch (retryErr) {
          attempts.push({ path: candidatePath, ok: false, error: `${message} → 清锁重试仍失败: ${retryErr.message}` });
          continue;
        }
      }

      attempts.push({ path: candidatePath, ok: false, error: message });
    }
  }

  const detail = attempts.map((a) => `${a.path} => ${a.ok ? 'ok' : a.error}`).join(' ; ');
  throw new Error(`所有候选数据库位置都打不开（driver=${DRIVER}）：${detail}`);
}

// 供 /api/health 诊断用
let OPEN_ATTEMPTS = [];
let INIT_ERROR = null;

function initDB() {
  const { db: opened, path: usedPath, attempts } = openDatabase();
  DB_PATH = usedPath;
  OPEN_ATTEMPTS = attempts;

  const db = adapt(opened);

  // WAL 与 busy_timeout 依赖原生文件系统语义，纯 JS 驱动不支持，跳过以免产生误导性配置
  if (DRIVER !== 'node-sqlite3-wasm' && usedPath !== ':memory:') {
    db.pragma('journal_mode = WAL');
    db.pragma('busy_timeout = 5000');
  }
  db.pragma('foreign_keys = ON');

  const schema = fs.readFileSync(SCHEMA_PATH, 'utf-8');
  db.exec(schema);

  // 简单迁移：给已存在的旧表补新字段
  migrate(db);

  console.log(`[DB] SQLite initialized at ${usedPath} (driver: ${DRIVER})`);
  return db;
}

function migrate(db) {
  // learning_record 补费曼字段
  const lrCols = db.prepare("PRAGMA table_info(learning_record)").all().map(c => c.name);
  if (!lrCols.includes('feynman_passed')) {
    db.exec("ALTER TABLE learning_record ADD COLUMN feynman_passed INTEGER DEFAULT 0");
  }
  if (!lrCols.includes('feynman_gaps')) {
    db.exec("ALTER TABLE learning_record ADD COLUMN feynman_gaps TEXT");
  }
}

let dbInstance = null;

function getDB() {
  if (!dbInstance) {
    try {
      dbInstance = initDB();
    } catch (e) {
      INIT_ERROR = e.message;
      throw e;
    }
  }
  return dbInstance;
}

function getDbInfo() {
  return {
    driver: DRIVER,
    path: DB_PATH,
    attempts: OPEN_ATTEMPTS,
    initError: INIT_ERROR,
    cwd: process.cwd(),
  };
}

module.exports = { getDB, initDB, getDbInfo, DB_PATH, DRIVER };
