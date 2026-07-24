const express = require('express');
const jwt = require('jsonwebtoken');
const db = require('./data/database'); // Week 5: Replaced hardcoded array with SQLite database

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET_KEY = 'your_secret_key_here'; // Note: Hardcoded secret is a known debt to be fixed in Week 7

app.use(express.json());

// Static files (HTML) පෙන්වීම සඳහා මෙය එකතු කරන්න
app.use(express.static('Day_04'));

// --- ROUTES ---

// Login Route: Queries the SQLite database securely using a prepared statement (?)
app.post('/login', (req, res) => {
  if (!req.body || !req.body.username || !req.body.password) {
    return res.status(400).json({
      message: 'Username and password are required.'
    });
  }
  const { username, password } = req.body;

  // Ask the database for one row matching this username.
  const foundUser = db
    .prepare('SELECT * FROM users WHERE username = ?')
    .get(username);

  if (!foundUser || foundUser.password !== password) {
    return res.status(401).json({
      message: 'Invalid username or password.'
    });
  }

  const token = jwt.sign(
    { id: foundUser.id, username: foundUser.username, role: foundUser.role },
    SECRET_KEY,
    { expiresIn: '1h' }
  );
  res.json({ message: 'Login successful!', token: token });
});

// Register Route: Inserts a new user and handles unique constraint violations cleanly
app.post('/register', (req, res) => {
  if (!req.body || !req.body.username || !req.body.password) {
    return res.status(400).json({
      message: 'Username and password are required.'
    });
  }
  const { username, password } = req.body;
  try {
    const result = db
      .prepare(
        'INSERT INTO users (username, password, role) VALUES (?, ?, ?)'
      )
      .run(username, password, 'student');
    res.status(201).json({
      message: 'User created!',
      id: result.lastInsertRowid
    });
  } catch (error) {
    // UNIQUE constraint fires if the username already exists.
    return res.status(409).json({
      message: 'That username is already taken.'
    });
  }
});

// Add this above your other routes
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Web App Development API!' });
});

// Stretch Goal Route: List all users (excluding passwords for security)
app.get('/users', (req, res) => {
  const users = db
    .prepare('SELECT id, username, role FROM users')
    .all();
  res.json(users);
});

// --- SERVER START ---
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});