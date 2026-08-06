const express = require('express');
const jwt = require('jsonwebtoken');
const db = require('./data/database');

const { verifytoken, security_key } = require('./middleware/auth');
const app = express();
const port = 3000;

app.use(express.json());

app.get('/', (req,res) => {
    res.send('my server is running...!');
});

app.use('/register' , (req,res)=>{
    if(!req.body || !req.body.username || !req.body.password){
        return res.status(400).json({
            message: "username and password are required..!"
        });
    }
    const {username, password} = req.body;
    try{
        const result = db.prepare(`
            insert into users (username, password, role) values (?, ?, ?)`).run(username, password, 'student');
            res.status(201).json({
                message: 'user registered successfully..!',
                id: result.lastInsertRowid,
                username: username,
                role: 'student'
            })
    } catch (error){
        if(error.message.includes('UNIQUE constraint failed: users.username')){
            return res.status(409).json({
                message: 'username already exists. Please choose a different username.'
            })
        }
        console.error('database error', error);
        return res.status(500).json({
            message: 'Internal server error. Please try again later.'
        })
    }

})

app.post('/login', (req, res) => {
    if (!req.body || !req.body.username || !req.body.password) {
        return res.status(400).json({
            message: 'username and password are required..!'
        })
    }

    const { username, password } = req.body;
    try {
        const founduser = db.prepare('select * from users where username = ? ').get(username);
        if (!founduser || founduser.password !== password){
            return res.status(401).json({
                message: 'invalid username and password..!'
            })
        }
        res.json({
            message: 'login successfully.. !',
            token: token,
            user: {
                id: founduser.id,
                username: founduser.username,
                role: founduser.role
            }
        });

    }catch (error){
        console.error('login error', error);
        return res.status(500).json({
            message: 'Internal server error. Please try again later.'
        })
        
    }

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



app.get('/dashboard', verifytoken, (req,res) => {
    res.json ({
        message: `welcome , ${req.user.username} to the dashboard..!`,
        yourrole: req.user.role,
        userid: req.user.id,
        data: {
            status: {
                totalusers: 0,
                lastlogin: new Date().toISOString()
            }
        }
    });
});




app.listen(port, ()=> {
    console.log(`server is running http://localhost:${port}`);
});