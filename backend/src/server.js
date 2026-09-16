require('dotenv').config();

const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const { getDB, DRIVER, getDbInfo } = require('./db/init');

const authRoutes = require('./routes/auth');
const diagnosisRoutes = require('./routes/diagnosis');
const scheduleRoutes = require('./routes/schedule');
const learnRoutes = require('./routes/learn');
const reviewRoutes = require('./routes/review');
const knowledgeRoutes = require('./routes/knowledge');
const scoreRoutes = require('./routes/score');
const growthRoutes = require('./routes/growth');
const { securityHeaders, globalLimiter } = require('./middleware/security');
const { requestTracker } = require('./middleware/requestTracker');
const { makeLogger } = require('./utils/logger');

const log = makeLogger('server');
const STARTED_AT = new Date().toISOString();

const app = express();
const PORT = process.env.PORT || 3001;
// 本地开发默认只监听回环（后端与数据库不暴露到局域网）；
// 云部署（单端口托管）时由 HOST=0.0.0.0 显式放开
const HOST = process.env.HOST || '127.0.0.1';
// 前端构建产物目录（部署时由 vite build 生成，与后端同端口托管）
const DIST_DIR = path.join(__dirname, '../../frontend/dist');
const HAS_DIST = fs.existsSync(path.join(DIST_DIR, 'index.html'));

// ===== 安全中间件（纵深防御）=====
app.use(securityHeaders);        // 安全响应头
app.use(globalLimiter);          // 全局限流（120次/分钟/IP）
app.use(express.json({ limit: '100kb' }));  // 请求体大小限制（防大payload攻击）

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Auth-Token']
}));

// ===== 请求追踪 + 耗时日志 =====
app.use(requestTracker);

// 登录态诊断：只看布尔值/计数/类型，不回传任何用户数据。
// 用途是定位「注册成功却带 token 401」这类只在特定环境复现的问题。
function buildAuthDiag(req) {
  const token = req.query.token;
  if (typeof token !== 'string' || token.length === 0) return null;

  try {
    const db = getDB();
    const scalar = (sql, ...args) => {
      const row = db.prepare(sql).get(...args);
      return row ? Object.values(row)[0] : null;
    };
    const sampleSession = db
      .prepare('SELECT token, LENGTH(token) AS len, user_id FROM session_token LIMIT 1')
      .get();
    const sampleUser = db.prepare('SELECT user_id FROM user_account LIMIT 1').get();

    return {
      receivedTokenLen: token.length,
      tokenRowExists: scalar('SELECT COUNT(*) AS c FROM session_token WHERE token = ?', token) > 0,
      joinRowExists:
        scalar(
          'SELECT COUNT(*) AS c FROM session_token st JOIN user_account ua ON ua.user_id = st.user_id WHERE st.token = ?',
          token
        ) > 0,
      sessionRows: scalar('SELECT COUNT(*) AS c FROM session_token'),
      userRows: scalar('SELECT COUNT(*) AS c FROM user_account'),
      joinRowsTotal: scalar(
        'SELECT COUNT(*) AS c FROM session_token st JOIN user_account ua ON ua.user_id = st.user_id'
      ),
      sampleSessionTokenLen: sampleSession ? sampleSession.len : null,
      sampleSessionUserIdType: sampleSession ? typeof sampleSession.user_id : null,
      sampleUserUserIdType: sampleUser ? typeof sampleUser.user_id : null,
      sampleUserIdSameValue:
        sampleSession && sampleUser ? sampleSession.user_id === sampleUser.user_id : null,
      authHeaderLen: (req.headers.authorization || '').length,
      authHeaderHasOurToken: String(req.headers.authorization || '').includes(token),
      authHeaderIndexOfToken: String(req.headers.authorization || '').indexOf(token),
      customHeaderLen: String(req.headers['x-auth-token'] || '').length,
      candidateCount: authRoutes.extractTokenCandidates(req).length,
    };
  } catch (e) {
    return { error: e.message };
  }
}

// ===== 健康检查（增强版：DB 状态 / 统计指标 / 启动时间 / 版本）=====
app.get('/api/health', (req, res) => {
  const uptimeSec = Math.floor((Date.now() - new Date(STARTED_AT).getTime()) / 1000);
  let dbStatus = 'ok';
  let stats = {};
  try {
    const db = getDB();
    stats = {
      users: db.prepare('SELECT COUNT(*) AS c FROM user_account').get().c,
      knowledgePoints: db.prepare('SELECT COUNT(*) AS c FROM knowledge_point').get().c,
      plans: db.prepare('SELECT COUNT(*) AS c FROM schedule_plan').get().c,
      learningRecords: db.prepare('SELECT COUNT(*) AS c FROM learning_record').get().c,
      wrongQuestions: db.prepare('SELECT COUNT(*) AS c FROM wrong_question').get().c,
      profiles: db.prepare('SELECT COUNT(*) AS c FROM learner_profile').get().c,
      activeSessions: db.prepare("SELECT COUNT(*) AS c FROM session_token WHERE expires_at > datetime('now')").get().c,
    };
  } catch (e) {
    dbStatus = 'error: ' + e.message;
  }

  res.json({
    status: 'ok',
    version: '1.0.0',
    startedAt: STARTED_AT,
    uptimeSec,
    db: dbStatus,
    sqliteDriver: DRIVER,
    dbPath: getDbInfo().path,
    dbCwd: getDbInfo().cwd,
    dbAttempts: getDbInfo().attempts,
    diag: buildAuthDiag(req),
    stats,
    node: process.version,
    platform: process.platform,
    pid: process.pid,
  });
});

// 登录/注册的严格限流在 auth.js 内部单独挂载（me/logout 不受限，避免刷新误伤）
app.use('/api/auth', authRoutes.router);
app.use('/api/diagnosis', diagnosisRoutes.router);
app.use('/api/schedule', scheduleRoutes.router);
app.use('/api/learn', learnRoutes.router);
app.use('/api/review', reviewRoutes.router);
app.use('/api/knowledge', knowledgeRoutes.router);
app.use('/api/score', scoreRoutes.router);
app.use('/api/growth', growthRoutes.router);

// ===== 前端托管（云部署单端口模式）=====
// 本地开发时前端跑在 Vite Dev Server 上，dist 不存在，这段自动跳过
if (HAS_DIST) {
  app.use(express.static(DIST_DIR, { index: false }));
  // SPA fallback：非 /api 的 GET 交给前端路由（BrowserRouter 直接刷新子路径不 404）
  app.get(/^\/(?!api\/).*/, (req, res, next) => {
    res.sendFile(path.join(DIST_DIR, 'index.html'), (err) => (err ? next(err) : undefined));
  });
  log.info('已托管前端构建产物', { dist: DIST_DIR });
}

app.use((err, req, res, next) => {
  log.error('unhandled', { reqId: req.requestId, msg: err.message, stack: err.stack });
  if (err.name === 'ZodError') {
    return res.status(400).json({ error: '输入校验失败', details: err.errors, reqId: req.requestId });
  }
  res.status(500).json({ error: '服务器内部错误', message: err.message, reqId: req.requestId });
});

// 首次启动自动灌入知识点目录（幂等：仅表为空时执行；云部署沙箱是全新库，必须有这步）
(function ensureSeeded() {
  try {
    const db = getDB();
    const { c } = db.prepare('SELECT COUNT(*) AS c FROM knowledge_point').get();
    if (c === 0) {
      log.info('知识点目录为空，执行 seed');
      require('../scripts/seed-knowledge');
    } else {
      log.info('知识点目录已存在，跳过 seed', { count: c });
    }
  } catch (e) {
    log.error('seed 检查失败', { msg: e.message });
  }
})();

const server = app.listen(PORT, HOST, () => {
  log.info(`running on http://${HOST}:${PORT}${HAS_DIST ? '（含前端页面）' : '（仅 API）'}`, { port: PORT, host: HOST });
});

// 端口被占用时明确报错退出，避免多个后端进程同时写 SQLite 导致锁冲突
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    log.error(`端口 ${PORT} 已被占用，已有后端进程在运行，本进程退出`, { port: PORT });
    process.exit(1);
  }
  log.error('启动失败', { msg: err.message });
  process.exit(1);
});
