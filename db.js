const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// создаём папку data если нет
const dataDir = path.join(__dirname, 'data');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
}

// путь к БД
const dbPath = path.join(dataDir, 'database.sqlite');

// создаём БД автоматически
const db = new sqlite3.Database(dbPath);

module.exports = db;
