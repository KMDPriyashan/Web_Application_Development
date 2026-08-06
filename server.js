const express = require('express');
const jwt = require('jsonwebtoken');

const users = require('./data/user');

const { verifytoken, security_key } = require('./middleware/auth');
const app = express();
const port = 3000;

app.use(express.json());

app.post('/login', (req, res) => {
    if (!req.body || !req.body.username || !req.body.password) {
        return res.status(400).json({
            message: 'username and password are required..!'
        })
    }

    const { username, password } = req.body;

    const founduser = users.find(
        (user) => user.username === username && user.password === password
    );

    if (!founduser) {
        return res.status(401).json({
            message: 'invalid username and password..!'
        });
    }

    const token = jwt.sign({
        id: founduser.id,
        username: founduser.username,
        role: founduser.role
    },
        security_key, {
        expiresIn: '1h'
    });

    res.json({
        message: 'login successfully.. !',
        token: token
    });
});

app.get('/', (req,res) => {
    res.send('my server is running...!');
});

app.get('/dashboard', verifytoken, (req,res) => {
    res.json ({
        message: `welcome , ${req.user.username} to the dashboard..!`,
        yourrole: req.user.role,
        userid: req.user.id
    });
});




app.listen(port, ()=> {
    console.log(`server is running http://localhost:${port}`);
    console.log('Database: user.db');
    
});