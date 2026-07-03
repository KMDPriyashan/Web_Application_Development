const express = require('express');
const mockData = require('./data');

const app = express();
const PORT = 3000;

app.get('/users', (req, res) => {
    response.send("hello my node.js server in Running !");
});