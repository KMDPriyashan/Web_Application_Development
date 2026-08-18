const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const users = require('./database/users');
const appointment = require('./database/appointment');

const app = express();
const port = 3000;


app.use(express.json());

app.get ('/', (req,res) => {
    res.send('Hello server is running..!');
});

app.listen(port , ()=>{
    console.log(`server is running on http://localhost:${port}`);
});

app.post('/register', async (req, res) => {
    if (!req.body || !req.body.username || !req.body.password) {
        return res.status(400).json({
            message: 'Username and password are required!'
        });
    }

    const { username, password } = req.body;

    try {
        const hashed = await bcrypt.hash(password, 10);
        const result = db
            .prepare('INSERT INTO users (username, password, role) VALUES (?, ?, ?)')
            .run(username, hashed, 'student');

        res.status(201).json({
            message: 'User registered successfully!',
            id: result.lastInsertRowid,  // ✅ lowercase 'l'
            username: username,
            role: 'student'
        });
    } catch (error) {
        if (error.message.includes('UNIQUE constraint failed')) {  // ✅ correct spelling
            return res.status(409).json({
                message: 'That username is already taken!'
            });
        }
        console.error('Database error:', error);
        return res.status(500).json({
            message: 'Something went wrong. Please try again.'  // ✅ correct spelling
        });
    }
});