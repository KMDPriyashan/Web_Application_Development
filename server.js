const express = require('express');
const jwt = require('jsonwebtoken');
const db = require('./data/database');
const { verifyToken, SECRET_KEY } = require('./middleware/auth');

const app = express();
const PORT = 3000;

// ===== MIDDLEWARE =====
// This unpacks JSON from POST requests
app.use(express.json());

// ===== PUBLIC ROUTE =====
app.get('/', (req, res) => {
  res.send('Hello! My Node.js server with database is running!');
});

// ===== REGISTER ROUTE =====
app.post('/register', (req, res) => {
  // Guard: Express leaves req.body undefined when no body sent
  if (!req.body || !req.body.username || !req.body.password) {
    return res.status(400).json({
      message: 'Username and password are required.'
    });
  }

  const { username, password } = req.body;

  try {
    // Insert new user into database
    const result = db
      .prepare(
        'INSERT INTO users (username, password, role) VALUES (?, ?, ?)'
      )
      .run(username, password, 'student');
    
    res.status(201).json({
      message: 'User created successfully!',
      id: result.lastInsertRowid,
      username: username,
      role: 'student'
    });
  } catch (error) {
    // UNIQUE constraint fires if username already exists
    if (error.message.includes('UNIQUE constraint failed')) {
      return res.status(409).json({
        message: 'That username is already taken.'
      });
    }
    // Any other database error
    console.error('Database error:', error);
    return res.status(500).json({
      message: 'Something went wrong. Please try again.'
    });
  }
});

// ===== LOGIN ROUTE =====
app.post('/login', (req, res) => {
  // Guard: Express leaves req.body undefined when no body sent
  if (!req.body || !req.body.username || !req.body.password) {
    return res.status(400).json({
      message: 'Username and password are required.'
    });
  }

  const { username, password } = req.body;

  try {
    // Ask the database for ONE row with this username
    const foundUser = db
      .prepare('SELECT * FROM users WHERE username = ?')
      .get(username);

    // User not found or wrong password
    if (!foundUser || foundUser.password !== password) {
      return res.status(401).json({
        message: 'Invalid username or password.'
      });
    }

    // Create JWT token - NEVER include password
    const token = jwt.sign(
      { 
        id: foundUser.id, 
        username: foundUser.username,
        role: foundUser.role 
      },
      SECRET_KEY,
      { expiresIn: '1h' }
    );

    // Send token back to client
    res.json({ 
      message: 'Login successful!', 
      token: token,
      user: {
        id: foundUser.id,
        username: foundUser.username,
        role: foundUser.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      message: 'Something went wrong. Please try again.'
    });
  }
});

// ===== PROTECTED ROUTE (Auth required) =====
app.get('/dashboard', verifyToken, (req, res) => {
  // req.user comes from the middleware
  res.json({
    message: `Welcome, ${req.user.username}!`,
    yourRole: req.user.role,
    userId: req.user.id,
    data: {
      // Mock dashboard data
      stats: {
        totalUsers: 0,
        lastLogin: new Date().toISOString()
      }
    }
  });
});

// ===== PROTECTED ROUTE: Get All Users (Admin only) =====
app.get('/api/users', verifyToken, (req, res) => {
  // Check if user is admin
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      message: 'Admin access required.'
    });
  }

  try {
    // Get all users from database
    const users = db
      .prepare('SELECT id, username, role, password FROM users')
      .all();
    
    res.json({
      users: users,
      count: users.length
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return res.status(500).json({
      message: 'Something went wrong.'
    });
  }
});

// ===== PROTECTED ROUTE: Get User Profile =====
app.get('/api/profile', verifyToken, (req, res) => {
  try {
    const user = db
      .prepare('SELECT id, username, role FROM users WHERE id = ?')
      .get(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        message: 'User not found.'
      });
    }
    
    res.json({ user });
  } catch (error) {
    console.error('Profile error:', error);
    return res.status(500).json({
      message: 'Something went wrong.'
    });
  }
});

// ===== START SERVER =====
app.listen(PORT, () => {
  console.log(`🚀 Server is listening on http://localhost:${PORT}`);
  console.log(`📚 Database: users.db`);
});