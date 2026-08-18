const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const db = require('./data/database');
const { verifyToken, SECRET_KEY } = require('./middleware/auth');
const AppointmentRow = require('./components/AppointmentRow');
const Page = require('./components/Page');

const app = express();
const PORT = 3000;

app.use(express.json());

// Welcome route
app.get('/', (req, res) => {
  res.send('🚀 Clinic Appointments API is running!');
});

// ============================================================
// QUESTION 2: Register (15 marks)
// ============================================================

app.post('/register', async (req, res) => {
  if (!req.body || !req.body.username || !req.body.password) {
    return res.status(400).json({
      message: 'Username and password are required.'
    });
  }

  const { username, password } = req.body;

  try {
    const hashed = await bcrypt.hash(password, 10);
    
    const result = db
      .prepare('INSERT INTO users (username, password, role) VALUES (?, ?, ?)')
      .run(username, hashed, 'user');
    
    res.status(201).json({
      message: 'User registered successfully!',
      id: result.lastInsertRowid,
      username: username,
      role: 'user'
    });
  } catch (error) {
    if (error.message.includes('UNIQUE constraint failed')) {
      return res.status(409).json({
        message: 'That username is already taken.'
      });
    }
    console.error('Database error:', error);
    return res.status(500).json({
      message: 'Something went wrong. Please try again.'
    });
  }
});

// ============================================================
// QUESTION 3: Login (15 marks)
// ============================================================

app.post('/login', async (req, res) => {
  if (!req.body || !req.body.username || !req.body.password) {
    return res.status(400).json({
      message: 'Username and password are required.'
    });
  }

  const { username, password } = req.body;

  try {
    const user = db
      .prepare('SELECT * FROM users WHERE username = ?')
      .get(username);

    const ok = user && (await bcrypt.compare(password, user.password));

    if (!ok) {
      return res.status(401).json({
        message: 'Invalid username or password.'
      });
    }

    const token = jwt.sign(
      { 
        id: user.id, 
        username: user.username,
        role: user.role 
      },
      SECRET_KEY,
      { expiresIn: '1h' }
    );

    res.json({ 
      message: 'Login successful!', 
      token: token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      message: 'Something went wrong. Please try again.'
    });
  }
});

// ============================================================
// QUESTION 5: Appointments - Read and Add (25 marks)
// ============================================================

// GET all appointments
app.get('/appointments', (req, res) => {
  try {
    const appointments = db
      .prepare('SELECT * FROM appointments')
      .all();
    
    res.json({
      appointments: appointments,
      count: appointments.length
    });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return res.status(500).json({
      message: 'Something went wrong. Please try again.'
    });
  }
});

// GET appointment by id
app.get('/appointments/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    const appointment = db
      .prepare('SELECT * FROM appointments WHERE id = ?')
      .get(id);
    
    if (!appointment) {
      return res.status(404).json({
        message: `Appointment with id ${id} not found.`
      });
    }
    
    res.json({ appointment });
  } catch (error) {
    console.error('Error fetching appointment:', error);
    return res.status(500).json({
      message: 'Something went wrong. Please try again.'
    });
  }
});

// POST add appointment (no token required)
app.post('/appointments', (req, res) => {
  if (!req.body || !req.body.patient || !req.body.reason) {
    return res.status(400).json({
      message: 'Patient and reason are required.'
    });
  }

  const { patient, reason } = req.body;

  try {
    const result = db
      .prepare('INSERT INTO appointments (patient, reason) VALUES (?, ?)')
      .run(patient, reason);
    
    res.status(201).json({
      message: 'Appointment created successfully!',
      id: result.lastInsertRowid,
      patient: patient,
      reason: reason
    });
  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).json({
      message: 'Something went wrong. Please try again.'
    });
  }
});

// ============================================================
// QUESTION 6: HTML Page (15 marks)
// ============================================================

app.get('/appointments-page', (req, res) => {
  try {
    const appointments = db
      .prepare('SELECT * FROM appointments')
      .all();

    const rows = appointments
      .map((app) => AppointmentRow(app))
      .join('');

    const table = `
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Patient</th>
            <th>Reason</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    `;

    res.send(Page('Clinic Appointments', table));
  } catch (error) {
    console.error('Error rendering page:', error);
    res.status(500).send('Something went wrong.');
  }
});

// ============================================================
// START SERVER
// ============================================================

app.listen(PORT, () => {
  console.log(`🚀 Server is listening on http://localhost:${PORT}`);
  console.log(`📚 Database: clinic.db`);
  console.log(`📄 Appointments page: http://localhost:${PORT}/appointments-page`);
  console.log(`🔐 Login: POST http://localhost:${PORT}/login`);
  console.log(`🔒 Register: POST http://localhost:${PORT}/register`);
  console.log(`📋 Appointments: GET http://localhost:${PORT}/appointments`);
});