import { Pool } from 'pg';

require('dotenv').config()

const pool = new Pool({
  user: process.env.DB_USER,
  host: 'localhost',
  database: process.env.DB_URL,
  password: process.env.DB_PASSWORD,
  max: 20,
  port: 5432,
});

async function queryAllIngredients() {
  return pool.query(`
    SELECT * FROM ingredients;
  `)
  .then(result => {
    return result.rows;
  });

}

async function queryRecipeById(id) {
  return pool.query(`
    SELECT 1 FROM recipe
    WHERE recipe.id = $1;
  `, [id])
  .then(result => {
    return result.rows[0] || null;
  });
}

async function queryRecipesByAnyIngredient(ingredients) {
  return pool.query(`
    SELECT * FROM recipe r 
    INNER JOIN recipe_ingredients ri ON r.id = ri.recipe_id 
    INNER JOIN ingredients i ON ri.ingredients_id = i.id 
    WHERE i.name IN ($1);
  `, [ingredients])
  .then(result => {
    return result.rows;
  });
}

async function queryRecipesByAllIngredients(ingredients) {
  return pool.query(`
    SELECT r.* FROM recipe r 
    INNER JOIN recipe_ingredients ri ON r.id = ri.recipe_id 
    INNER JOIN ingredients i ON ri.ingredients_id = i.id 
    WHERE i.name = ANY($1) 
    GROUP BY r.id, r.name, r.description, r.createdDate, r.modifiedDate, r.user_id 
    HAVING COUNT(DISTINCT i.name) = $2
  `, [ingredients])
  .then(result => {
    return result.rows;
  });
}

async function querySimilarRecipeNames(searchString) {
  return pool.query(`
      SELECT * FROM recipe r WHERE (similarity(r.name, $1) > 0.7);
  `, [searchString])
  .then(result => {
    return result.rows
  });
}

function queryTopRatedRecipes(number_of_recipes) {
  const result = pool.query(`
    SELECT r.*, AVG(rv.rating) as avg_rating
    FROM recipe r
    JOIN review rv ON r.id = rv.recipe_id
    GROUP BY r.id, r.name, r.description, r.createdDate, r.modifiedDate, r.user_id
    ORDER BY avg_rating DESC
    LIMIT $1;
  `, [number_of_recipes]);

  return result.rows;
}

async function processLogin(email, password) {
  return pool.query(`
    SELECT id, name, email FROM users 
    WHERE email = $1 
    AND password = $2;
  `, [email, password])
  .then(result => {
    return result.rows[0] || null; // return user object or null
  });
}

function processSignup(name, email, password) {
  return pool.query(`
    INSERT INTO users (name, email, password)
    VALUES ($1, $2, $3);
  `, [name, email, password]);
}

export { 
  queryAllIngredients,
  queryRecipeById,
  queryRecipesByAnyIngredient,
  queryRecipesByAllIngredients, 
  querySimilarRecipeNames,
  queryTopRatedRecipes,
  processLogin,
  processSignup
}
