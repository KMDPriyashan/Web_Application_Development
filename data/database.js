const Database = require('better-sqlite3');
const bcrypt = require('bcrypt');

const db = new Database('clinic.db');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id       INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role     TEXT NOT NULL
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS appointments (
    id      INTEGER PRIMARY KEY AUTOINCREMENT,
    patient TEXT NOT NULL,
    reason  TEXT NOT NULL
  )
`);

// Check if admin user exists
const adminCheck = db.prepare('SELECT COUNT(*) AS count FROM users WHERE username = ?').get('reception');

if (adminCheck.count === 0) {
  // Hash the admin password
  const hashed = bcrypt.hashSync('admin123', 10);
  
  const insertUser = db.prepare('INSERT INTO users (username, password, role) VALUES (?, ?, ?)');
  insertUser.run('reception', hashed, 'admin');
  console.log('✅ Admin user seeded: reception / admin123');
}

// Check if appointments exist
const appCheck = db.prepare('SELECT COUNT(*) AS count FROM appointments').get();

if (appCheck.count === 0) {
  const insertApp = db.prepare('INSERT INTO appointments (patient, reason) VALUES (?, ?)');
  insertApp.run('Kamal', 'Fever');
  insertApp.run('Nimali', 'Checkup');
  insertApp.run('Sunil', 'Follow-up');
  console.log('✅ 3 appointments seeded');
}

console.log('✅ Database connected and ready');
module.exports = db;