const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '../../data/data.db');
const SCHEMA_PATH = path.join(__dirname, 'schema.sql');

function initDB() {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  // 写锁冲突时等待 5 秒，避免多进程/并发写导致 "database is locked" 500
  db.pragma('busy_timeout = 5000');

  const schema = fs.readFileSync(SCHEMA_PATH, 'utf-8');
  db.exec(schema);

  // 简单迁移：给已存在的旧表补新字段
  migrate(db);

  console.log('[DB] SQLite initialized at', DB_PATH);
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
    dbInstance = initDB();
  }
  return dbInstance;
}

module.exports = { getDB, initDB, DB_PATH };
