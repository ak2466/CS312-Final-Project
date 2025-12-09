import { Pool } from 'pg';
import 'dotenv/config';
import { List } from 'lucide-react';

const RECIPE_CARDS_QUERY = {
  select: `
      recipe_id,
      name,
      recipe_description,
      "image_url",
      "cook_time",
      TRUNC(AVG(average_rating), 2) AS average_rating,
      total_ratings,
      JSON_AGG(DISTINCT JSONB_BUILD_OBJECT('id', tag_id, 'name', tag_name)) AS tags`,
    from: `
    full_recipe
    `,
    group_by: `
      recipe_id,
      name,
      recipe_description,
      "image_url",
      "cook_time",
      total_ratings
    `};

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

  try {
    return pool.query(`
      SELECT * FROM full_recipe r
      WHERE r.recipe_id = $1
      ORDER BY r.step_num ASC, r.ingredient_name ASC;
    `, [id])
    .then(result => {

      return transformRowsToRecipe(result.rows);
    })
  } catch(error) {
    console.error("Database Query Error:", error);
    throw error;
  }
}

function transformRowsToRecipe(rows) {
  
  if (rows.length === 0) {
        return null;
    }

    const firstRow = rows[0];

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
    const uniqTags = new Map();

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

      const tag = {
        id: row.tag_id,
        name: row.tag_name
      };

      uniqSteps.set(step.id, step);
      uniqIngredients.set(ingredient.id, ingredient);
      uniqTags.set(tag.id, tag);

    });

    // Convert to arrays
    recipe.steps = [...uniqSteps.values()];
    recipe.ingredients = [...uniqIngredients.values()];
    recipe.tags = [...uniqTags.values()];

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

  try {

    const result = await pool.query(`
      SELECT ${RECIPE_CARDS_QUERY.select},
      TS_RANK(tsv, plainto_tsquery('english', $1)) AS rank
      FROM ${RECIPE_CARDS_QUERY.from}
      WHERE tsv @@ plainto_tsquery('english', $1)
      GROUP BY ${RECIPE_CARDS_QUERY.group_by},
      tsv
      ORDER BY rank DESC;
    `, [searchString]);

      return result.rows;

  } catch(error) {
    console.error("Error querying similar recipe names: ", error);
    throw error;
  }

}

async function queryTopRatedRecipes(number_of_recipes) {

    try {
      const result = await pool.query(`
      SELECT
        recipe_id,
        name,
        recipe_description,
        "image_url",
        "cook_time",
        TRUNC(AVG(average_rating), 2) AS average_rating,
        total_ratings,
        JSON_AGG(DISTINCT JSONB_BUILD_OBJECT('id', tag_id, 'name', tag_name)) AS tags
      FROM full_recipe
      GROUP BY
        recipe_id,
        name,
        recipe_description,
        "image_url",
        "cook_time",
        total_ratings
      HAVING
        MAX(total_ratings) > 0
      ORDER BY
          average_rating DESC,
          total_ratings DESC
      LIMIT $1;
      `, [number_of_recipes]);

      return result.rows;

  } catch(error) {
    console.error("Database Query Error:", error);
    throw error;
  }
}

// async function queryTopRatedRecipes(number_of_recipes) {
//   return pool.query(`
//     SELECT r.*, COALESCE(AVG(rv."rating"), 0) as avg_rating
//     FROM recipe r
//     LEFT JOIN review rv ON r.id = rv."recipe_id"
//     GROUP BY r.id, r.name, r.description, r."createdDate", r."modifiedDate", r.user_id
//     ORDER BY avg_rating DESC
//     LIMIT $1;
//   `, [number_of_recipes])
//   .then(result => {
//     return result.rows;
//   });
// }

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

function insertBuilder(table_name, map, options = {}) {
  const { onConflict = "", returning = "" } = options;

  const columns = Array.from(map.keys());
  const valueArrays = Array.from(map.values());

  // Number of rows from the first key's array
  const rowCount = valueArrays[0].length;

  // Verify all arrays have same length
  for (const arr of valueArrays) {
    if (arr.length !== rowCount) {
      throw new Error("All value arrays must have the same length");
    }
  }

  let str = `INSERT INTO ${table_name} (${columns.join(', ')}) VALUES `;

  let paramIndex = 1;
  const valueGroups = [];

  for (let row = 0; row < rowCount; row++) {
    const placeholders = [];

    for (let col = 0; col < columns.length; col++) {
      placeholders.push(`$${paramIndex++}`);
    }

    valueGroups.push(`(${placeholders.join(', ')})`);
  }

  str += valueGroups.join(', ');

  // Append optional clauses
  if (onConflict) {
    str += ` ${onConflict}`;
  }
  if (returning) {
    str += ` ${returning}`;
  }

  // Also return flattened values array for prepared statement
  const flatValues = [];
  for (let row = 0; row < rowCount; row++) {
    for (let col = 0; col < columns.length; col++) {
      flatValues.push(valueArrays[col][row]);
    }
  }

  return { sql: str, values: flatValues };
}

async function insertIngredients(client, recipe_id, ingredients)
{
  if (!ingredients || ingredients.length === 0) {
    return;
  }

  const lowercaseIngredients = ingredients.map(ingredient => ingredient.name.toLowerCase());

  // Not making ingredients unique yet, as some may have same name but diff notes
  // Will make ingredients unique when inserting into ingredient table,
  // But will keep separate when inserting into recipe_ingredient table

  // Make ingredients unique by name
  const uniqIngredients = [...new Set(lowercaseIngredients)];

  const ingredientMap = new Map([
    ["name", uniqIngredients]
  ]);

  const { sql: ingredientSQL, values: ingredientValues } = insertBuilder("ingredients", ingredientMap, {
      onConflict: "ON CONFLICT (LOWER(name)) DO NOTHING"
  });

  let res = null;
  
  // Execute insert statement
  try
  {
    res = await client.query(ingredientSQL, ingredientValues);
  } catch(error) {
      console.error("Error inserting ingredients: ", error);
      throw error;
  }

  // Attempt to select from insert statement to get IDs
  const selectPlaceholders = uniqIngredients.map((_, i) => `$${i + 1}`).join(', ');
  console.log("SELECT PLACEHOLDERS: ", selectPlaceholders);
  console.log("UNIQUE INGREDIENTS: ", uniqIngredients);

  let ingredientIDResult = null;

  try {

    ingredientIDResult = await client.query(`
      SELECT id, name FROM ingredients
      WHERE name IN (${selectPlaceholders});
    `, uniqIngredients);

    console.log(ingredientIDResult.rows);

  } catch(error) {
    console.error("ERROR Selecting ingredients in Upsert function: ", error);
    throw error;
  }

  const ingredientIDMap = new Map();

  ingredientIDResult.rows.map(ingredientResult => {
    ingredientIDMap.set(ingredientResult.name, ingredientResult.id);
  })

  console.log("ingredientIDMap", ingredientIDMap);

  const builderMap = new Map([
    ["recipe_id", new Array()],
    ["ingredients_id", new Array()],
    ["quantity", new Array()],
    ["unit", new Array()],
    ["notes", new Array()]
  ]);

  ingredients.map(ingredient => {

    builderMap.get("recipe_id").push(recipe_id);

    const ingredient_id = ingredientIDMap.get(ingredient.name.toLowerCase().trim());
    builderMap.get("ingredients_id").push(ingredient_id);

    builderMap.get("quantity").push(ingredient.quantity);
    builderMap.get("unit").push(ingredient.unit);
    builderMap.get("notes").push(ingredient.notes || null);
  })

  console.log("BUILDER MAP: ", builderMap);

  const {sql: recipeIngredientSQL, values: recipeIngredientValues} = 
  insertBuilder('recipe_ingredients', builderMap);

  console.log("RECIPE INGREDIENTS SQL: ", recipeIngredientSQL);
  console.log("RECIPE INGREDIENTS VALUES, ", recipeIngredientValues);

  let test = null;

  try {
    test = await client.query(recipeIngredientSQL, recipeIngredientValues);
  } catch(error) {
    console.error("ERROR inserting into recipe_ingredients table", error);
    throw error;
  }

  test = await client.query(`
    SELECT * FROM full_recipe WHERE recipe_id = $1`, [recipe_id]);

  console.log("TEST: ", test.rows);
}


async function insertTags(client, recipe_id, tags)
{
  if (!tags || tags.length === 0) {
    return;
  }

  //Transform tags
  const lowercaseTags = tags.map(tag => tag.toLowerCase());
  const uniqueTags = [...new Set(lowercaseTags)];

  const tagMap = new Map([
    ["name", uniqueTags]
  ]);

  const { sql, values } = insertBuilder("tag", tagMap, {
    onConflict: "ON CONFLICT (LOWER(name)) DO NOTHING"
  });

  let res = null;

  try
  {
    // Attempt to insert tag names
    // If there's an error, do nothing
    res = await client.query(sql, values);
  } catch(error) {
    console.error("Error inserting tags: ", error);
    throw error;
  }

  // Now, run select statement to get tags by name.
  // This will get existing tags, as well as new tags that had to be created.

  const selectPlaceholders = uniqueTags.map((_, i) => `$${i + 1}`).join(', ');

  const tagIdResult = await client.query(`
    SELECT id, name FROM tag
    WHERE name IN (${selectPlaceholders});
  `, uniqueTags);

    const builderMap = new Map([
      ["recipe_id", new Array()],
      ["tag_id", new Array()]
    ]);

    tagIdResult.rows.map(row => {

      builderMap.get("recipe_id").push(recipe_id);
      builderMap.get("tag_id").push(row.id);

    })

    const {sql: recipeTagSql, values: recipeTagValues} = insertBuilder('recipe_tags', builderMap);

    await client.query(recipeTagSql, recipeTagValues);
}

function buildStepsInsert(recipe_id, steps)
{
  const values = [];
  const placeholders = [];
  let paramIndex = 1;

  if (!steps || !(steps.length > 0)) {
    return;
  }

  steps.forEach((description, index) => {

    const stepNum = index + 1;

    values.push(stepNum, description, recipe_id);
    placeholders.push(`($${paramIndex++}, $${paramIndex++}, $${paramIndex++})`);
  });

  // 2. Use .join(', ') on the placeholders array
    const placeholderString = placeholders.join(', ');

    // 3. Assemble the final SQL string
    const sql = `
        INSERT INTO steps (step_num, description, recipe_id)
        VALUES ${placeholderString};
    `;

    console.log("SQL: ", sql);
    console.log("Values: ", values);

    return {sql, values};
}

async function createRecipe(recipe)
{


  const client = await pool.connect();

  try {

    await client.query('BEGIN');
    await client.query(`SAVEPOINT test1`);

    // Insert recipe

    const {name, description, user_id, image_url, ingredients} = recipe;
    const cook_time = recipe.cook_time === '' ? null : recipe.cook_time;

    console.log("INGREDIENTS IN CREATERECIPE: ", ingredients);

    const response = await client.query(
    `INSERT INTO recipe 
    (name, description, "createdDate", "modifiedDate", user_id, cook_time, image_url)
    VALUES ($1, $2, NOW(), NOW(), $3, $4, $5)
    RETURNING id;
    `, [name, description, user_id, cook_time, image_url] );

    // Insert steps
    const recipe_id = response.rows[0].id;

    console.log("RECIPE ID: ", recipe_id);
    const res = buildStepsInsert(recipe_id, recipe.steps);

    if (res) {
      const {sql, values} = res;

      if (sql) { // Add a check to ensure sql is not empty/null
        await client.query(sql, values);
        console.log(`Inserted ${recipe.steps.length} steps.`);
      }
    }

    // Insert tags
    await insertTags(client, recipe_id, recipe.tags);

    // Insert ingredients
    await insertIngredients(client, recipe_id, ingredients);

    await client.query('COMMIT');

  } catch(error) {
    console.error("ERROR INSERTING: ", error);
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

// async function createRecipe(name, description, userId, ingredients, steps, tags) {
//   const client = await pool.connect();
//   try {
//     await client.query('BEGIN');
//     const recipeResult = await client.query(`
//       INSERT INTO recipe (name, description, "createdDate", "modifiedDate", user_id)
//       VALUES ($1, $2, NOW(), NOW(), $3)
//       RETURNING id;
//     `, [name, description, userId]);
    
//     const recipeId = recipeResult.rows[0].id;

//     if (ingredients && ingredients.length > 0) {
//       for (const ingredient of ingredients) {
//         let ingredientId;
//         const existingIngredient = await client.query(
//           'SELECT id FROM ingredients WHERE LOWER(name) = LOWER($1)',
//           [ingredient.name]
//         );
        
//         if (existingIngredient.rows.length > 0) {
//           ingredientId = existingIngredient.rows[0].id;
//         } else {
//           const newIngredient = await client.query(
//             'INSERT INTO ingredients (name) VALUES ($1) RETURNING id',
//             [ingredient.name]
//           );
//           ingredientId = newIngredient.rows[0].id;
//         }

//         await client.query(`
//           INSERT INTO recipe_ingredients (recipe_id, ingredients_id, quantity, unit, notes)
//           VALUES ($1, $2, $3, $4, $5);
//         `, [recipeId, ingredientId, ingredient.quantity, ingredient.unit, ingredient.notes || null]);
//       }
//     }

//     if (steps && steps.length > 0) {
//       for (let i = 0; i < steps.length; i++) {
//         await client.query(`
//           INSERT INTO steps (step_num, description, recipe_id)
//           VALUES ($1, $2, $3);
//         `, [i + 1, steps[i], recipeId]);
//       }
//     }

//     if (tags && tags.length > 0) {
//       for (const tagName of tags) {
//         let tagId;
//         const existingTag = await client.query(
//           'SELECT id FROM tag WHERE LOWER(name) = LOWER($1)',
//           [tagName]
//         );
        
//         if (existingTag.rows.length > 0) {
//           tagId = existingTag.rows[0].id;
//         } else {
//           const newTag = await client.query(
//             'INSERT INTO tag (name) VALUES ($1) RETURNING id',
//             [tagName]
//           );
//           tagId = newTag.rows[0].id;
//         }

//         await client.query(`
//           INSERT INTO recipe_tags (recipe_id, tag_id)
//           VALUES ($1, $2);
//         `, [recipeId, tagId]);
//       }
//     }

//     await client.query('COMMIT');
//     return { id: recipeId };
//   } catch (error) {
//     await client.query('ROLLBACK');
//     throw error;
//   } finally {
//     client.release();
//   }
// }

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
