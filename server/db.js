const Database = require('better-sqlite3')
const bcrypt = require('bcryptjs')
const path = require('path')

const dbPath = path.join(__dirname, 'skipq.db')
const db = new Database(dbPath)
db.pragma('journal_mode = WAL')

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'customer'
);
CREATE TABLE IF NOT EXISTS services (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  prefix TEXT NOT NULL,
  avg_minutes REAL NOT NULL DEFAULT 5,
  counters INTEGER NOT NULL DEFAULT 2,
  paused INTEGER NOT NULL DEFAULT 0,
  seq INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS tokens (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  service_id INTEGER NOT NULL REFERENCES services(id),
  user_id INTEGER REFERENCES users(id),
  guest_name TEXT,
  number INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'waiting',
  counter INTEGER,
  created_at INTEGER NOT NULL,
  called_at INTEGER,
  done_at INTEGER
);
CREATE INDEX IF NOT EXISTS idx_tokens_queue ON tokens(service_id, status, number);
CREATE TABLE IF NOT EXISTS ratings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  token_id INTEGER NOT NULL UNIQUE REFERENCES tokens(id),
  service_id INTEGER NOT NULL REFERENCES services(id),
  user_id INTEGER NOT NULL REFERENCES users(id),
  stars INTEGER NOT NULL,
  comment TEXT,
  created_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  read INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL
);
`)

const { migrateAndSeed } = require('./migrate')
migrateAndSeed(db)

module.exports = db
