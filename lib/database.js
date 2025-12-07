import { Pool } from 'pg';
import 'dotenv/config';

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
    SELECT * FROM full_recipe r
    WHERE r.recipe_id = $1
    ORDER BY r.step_num ASC, r.ingredient_name ASC;
  `, [id])
  .then(result => {

    return transformRowsToRecipe(result.rows);
  })
  .catch(error => {
    console.error("Database Query Error:", error);
    throw error;
  });
}

function transformRowsToRecipe(rows) {
  
  if (rows.length === 0) {
        return null;
    }

    const firstRow = rows[0];

    console.log(firstRow);

    const recipe = {
      id: firstRow.recipe_id,
      name: firstRow.name,
      createdDate: firstRow.createdDate,
      modifiedDate: firstRow.modifiedDate,
      cook_time: firstRow.cook_time,
      image_url: firstRow.image_url,
      steps: [],
      ingredients: []
    };

    const uniqSteps = new Map();
    const uniqIngredients = new Map();

    rows.forEach(row => {

      const step = {
        id: row.step_id,
        num: row.step_num,
        description: row.step_description
      };

      const ingredient = {
        id: row.ingredient_id,
        name: row.ingredient_name,
        unit: row.unit,
        quantity: row.quantity,
        notes: row.notes
      };

      uniqSteps.set(step.id, step);
      uniqIngredients.set(ingredient.id, ingredient);

    });

    // Convert to arrays
    recipe.steps = [...uniqSteps.values()];
    recipe.ingredients = [...uniqIngredients.values()];

    return recipe;
}

async function queryRecipesByAnyIngredient(ingredients) {
  return pool.query(`
    SELECT * FROM recipe r 
    INNER JOIN recipe_ingredients ri ON r.id = ri.recipe_id 
    INNER JOIN ingredients i ON ri.ingredients_id = i.id 
    WHERE i.name IN ($1);
  `, [ingredients])
  .then(result => {

    const rows = result.rows;
    return transformRowsToRecipe(rows);

  });
}

async function queryRecipesByAllIngredients(ingredients) {
  return pool.query(`
    SELECT r.* FROM recipe r 
    INNER JOIN recipe_ingredients ri ON r.id = ri.recipe_id 
    INNER JOIN ingredients i ON ri.ingredients_id = i.id 
    WHERE i.name = ANY($1) 
    GROUP BY r.id, r.name, r.description, r."createdDate", r."modifiedDate", r.user_id 
    HAVING COUNT(DISTINCT i.name) = $2
  `, [ingredients])
  .then(result => {
    return result.rows;
  });
}

async function querySimilarRecipeNames(searchString) {
  return pool.query(`
      SELECT * FROM recipe r WHERE $1 IS NULL OR similarity(r.name, $1) > 0.7;
  `, [searchString])
  .then(result => {
    return result.rows
  });
}

async function queryTopRatedRecipes(number_of_recipes) {
  return pool.query(`
    SELECT r.*, COALESCE(AVG(rv."rating"), 0) as avg_rating
    FROM recipe r
    LEFT JOIN review rv ON r.id = rv."recipe_id"
    GROUP BY r.id, r.name, r.description, r."createdDate", r."modifiedDate", r.user_id
    ORDER BY avg_rating DESC
    LIMIT $1;
  `, [number_of_recipes])
  .then(result => {
    return result.rows;
  });
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

async function createRecipe(name, description, userId, ingredients, steps, tags) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const recipeResult = await client.query(`
      INSERT INTO recipe (name, description, "createdDate", "modifiedDate", user_id)
      VALUES ($1, $2, NOW(), NOW(), $3)
      RETURNING id;
    `, [name, description, userId]);
    
    const recipeId = recipeResult.rows[0].id;

    if (ingredients && ingredients.length > 0) {
      for (const ingredient of ingredients) {
        let ingredientId;
        const existingIngredient = await client.query(
          'SELECT id FROM ingredients WHERE LOWER(name) = LOWER($1)',
          [ingredient.name]
        );
        
        if (existingIngredient.rows.length > 0) {
          ingredientId = existingIngredient.rows[0].id;
        } else {
          const newIngredient = await client.query(
            'INSERT INTO ingredients (name) VALUES ($1) RETURNING id',
            [ingredient.name]
          );
          ingredientId = newIngredient.rows[0].id;
        }

        await client.query(`
          INSERT INTO recipe_ingredients (recipe_id, ingredients_id, quantity, unit, notes)
          VALUES ($1, $2, $3, $4, $5);
        `, [recipeId, ingredientId, ingredient.quantity, ingredient.unit, ingredient.notes || null]);
      }
    }

    if (steps && steps.length > 0) {
      for (let i = 0; i < steps.length; i++) {
        await client.query(`
          INSERT INTO steps (step_num, description, recipe_id)
          VALUES ($1, $2, $3);
        `, [i + 1, steps[i], recipeId]);
      }
    }

    if (tags && tags.length > 0) {
      for (const tagName of tags) {
        let tagId;
        const existingTag = await client.query(
          'SELECT id FROM tag WHERE LOWER(name) = LOWER($1)',
          [tagName]
        );
        
        if (existingTag.rows.length > 0) {
          tagId = existingTag.rows[0].id;
        } else {
          const newTag = await client.query(
            'INSERT INTO tag (name) VALUES ($1) RETURNING id',
            [tagName]
          );
          tagId = newTag.rows[0].id;
        }

        await client.query(`
          INSERT INTO recipe_tags (recipe_id, tag_id)
          VALUES ($1, $2);
        `, [recipeId, tagId]);
      }
    }

    await client.query('COMMIT');
    return { id: recipeId };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export { 
  queryAllIngredients,
  queryRecipeById,
  queryRecipesByAnyIngredient,
  queryRecipesByAllIngredients, 
  querySimilarRecipeNames,
  queryTopRatedRecipes,
  processLogin,
  processSignup,
  createRecipe
}
