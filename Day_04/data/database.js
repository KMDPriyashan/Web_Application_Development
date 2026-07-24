// Week 5: a real database, on disk. Replaces last week's hardcoded array.
const Database = require('better-sqlite3');

// Opens users.db, or creates the file the first time it runs.
const db = new Database('users.db');

// Create the table once. IF NOT EXISTS means running this twice is safe.
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id       INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role     TEXT NOT NULL
  )
`);

// Seed two users, but only if the table is empty.
const count = db.prepare('SELECT COUNT(*) AS n FROM users').get();
if (count.n === 0) {
  const insert = db.prepare(
    'INSERT INTO users (username, password, role) VALUES (?, ?, ?)'
  );
  insert.run('kamal', '1234', 'admin');
  insert.run('nimali', 'abcd', 'student');
  console.log('Database seeded with 2 users.');
}

module.exports = db;