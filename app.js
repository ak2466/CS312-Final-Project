const express = require('express');
const app = express();
const port = 3000;

// middleware 
app.use(express.json()); // parse json request bodies
app.use(express.urlencoded({ extended: true })); // parse url-encoded request bodies

// routes

// react client
app.get('/', (req, res) => {
  res.send('hello world!'); // TODO: return react app
});


// api

// get recipe by id
app.get('api/recipe/:id', (req, res) => {
  res.json({ message: 'Not implemented' });
});

// get top recipes for home page
app.get('/api/recipes-top', (req, res) => {
  res.json({ message: 'Not implemented' });
});

// process signup
app.post('api/signup', (req, res) => {
  res.json({ message: 'Not implemented' });
});

// process login
app.post('/api/login', (req, res) => {
  res.json({ message: 'Not implemented' });
});


app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
