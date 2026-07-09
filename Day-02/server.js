const express = require('express');
const mockData = require('./data');

const app = express();
const PORT = 3000;

app.get('/users', (request, response) => {
    response.json(mockData.users);
});

app.get('/',(request, response) => {
    response.send("hello my node.js server in Running !");
});
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});