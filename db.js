const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Create data folder if it doesn't exist
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
}

const dbPath = path.join(dataDir, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

// Create tables on startup
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT UNIQUE,
    password TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    title TEXT,
    subject TEXT,
    priority TEXT,
    date TEXT
  )`);

  // Resources table for API #3 (Smart Resource Library)
  db.run(`CREATE TABLE IF NOT EXISTS resources (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    topic TEXT,
    title TEXT,
    summary TEXT,
    url TEXT,
    saved_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
});

module.exports = db;
