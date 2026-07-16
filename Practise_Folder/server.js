const express = require('express');
const bookdata = require('./data');

const app = express();
const port = 3000;

app.use(express.json());

app.get('/', (req,res) =>{
    res.send("Server is running !..");
});

app.get('/books', (req,res) =>{
    res.json(bookdata);
});

app.post('/books', (req,res) =>{
    const newBook = req.body;
    bookdata.push(newBook);
    res.send("New Book Added successfully !...");
});

app.listen(port, () =>{
    console.log(`server running on http://localhost:${port}`);
});