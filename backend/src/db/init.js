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

  const schema = fs.readFileSync(SCHEMA_PATH, 'utf-8');
  db.exec(schema);

  console.log('[DB] SQLite initialized at', DB_PATH);
  return db;
}

let dbInstance = null;

function getDB() {
  if (!dbInstance) {
    dbInstance = initDB();
  }
  return dbInstance;
}

module.exports = { getDB, initDB, DB_PATH };
