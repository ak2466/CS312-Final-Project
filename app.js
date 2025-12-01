import express from 'express';
import jwt from 'jsonwebtoken';
const app = express();
const port = 3000;

import { 
  queryAllIngredients,
  queryRecipeById,
  queryRecipesByAnyIngredient,
  queryRecipesByAllIngredients, 
  querySimilarRecipeNames,
  queryTopRatedRecipes,
  processLogin,
  processSignup,
  createRecipe
} from './lib/database.js';

// middleware 
app.use(express.json()); // parse json request bodies
app.use(express.urlencoded({ extended: true })); // parse url-encoded request bodies

// routes

// react client
app.get('/', (_, res) => {
  res.send('hello world!'); // TODO: return react app
});

// api

// get recipe by id
app.get('/api/recipe/:id', async (req, res) => {
  const recipeId = req.params.id;
  try {
    const queryResult = await queryRecipeById(recipeId);
    res.json({ message: 'Success', data: queryResult });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching recipe', error: error.message });
  }
});

// get top recipes for home page
app.get('/api/recipes-top', async (_, res) => {
  try {
    const queryResult = await queryTopRatedRecipes(50); // top 50 recipes
    res.json({ message: 'Success', data: queryResult });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching recipes', error: error.message });
  }
});

app.get('/api/search/', async (req, res) => {
  const searchString = req.query.search;

  try {
    const queryResult = await querySimilarRecipeNames(searchString);
    res.json({ message: "Success", data: queryResult });
  } catch {
    res.status(500).json({ message: 'Error fetching recipes', error: error.message });
  }
});

// process signup
app.post('/api/signup', async (req, res) => {
  const signup_data = req.body;
  try {
    await processSignup(signup_data.name, signup_data.email, signup_data.password);
    res.json({ message: 'Signup successful' });
  } catch (error) {
    res.status(400).json({ message: 'Signup failed', error: error.message });
  }
});

// process login
app.post('/api/login', async (req, res) => {
  const login_data = req.body;
  const user = await processLogin(login_data.email, login_data.password);
  if (user) {
    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ message: 'Login successful', token });
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
});

// create a new recipe
app.post('/api/recipe', async (req, res) => {
  const { name, description, userId, ingredients, steps, tags } = req.body;
  
  // Validate required fields
  if (!name || !description || !userId) {
    return res.status(400).json({ message: 'Missing required fields: name, description, and userId are required' });
  }

  try {
    const result = await createRecipe(name, description, userId, ingredients, steps, tags);
    res.status(201).json({ message: 'Recipe created successfully', data: result });
  } catch (error) {
    res.status(500).json({ message: 'Error creating recipe', error: error.message });
  }
});


app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
