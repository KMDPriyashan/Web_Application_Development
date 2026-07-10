const { request } = require("express");

const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.json());

let books = [
    {id: 1,title: "The Great Gatsby", author: "F. Scott Fitzgerald"},
    {id: 2,title: "To Kill a Mockingbird", author: "Harper Lee"},
    {id: 3,title: "1984", author: "George Orwell"},
    {id: 4,title: "Pride and Prejudice", author: "Jane Austen"},
    {id: 5,title: "The Catcher in the Rye", author: "J.D. Salinger"}
];

app.get('/', (req, res) => {
    res.send("Hello my node.js server is running!");
});

app.get('/api/books', (req ,res)=> {
    res.json(books);
});

app.post('/api/books', (req, res) => {
    const newBook = req.body;
    books.push(newBook);
    res.send("Book Add Sucessfully !");
});

app.listen(PORT,()=>{
    console.log(`Server is running on http://localhost:${PORT}`);
});