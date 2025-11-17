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

function queryAllIngredients() {
    const result = pool.query(`
        SELECT * FROM ingredients;
    `);

    return result.rows;
}

function queryRecipesByAnyIngredient(ingredients) {
    const result = pool.query(`
        SELECT * FROM recipe r 
        INNER JOIN recipe_ingredients ri ON r.id = ri.recipe_id 
        INNER JOIN ingredients i ON ri.ingredients_id = i.id 
        WHERE i.name IN ($1);
    `, [ingredients]);

    return result.rows;
}

function queryRecipesByAllIngredients(ingredients) {
    const result = pool.query(`
        SELECT r.* FROM recipe r 
        INNER JOIN recipe_ingredients ri ON r.id = ri.recipe_id 
        INNER JOIN ingredients i ON ri.ingredients_id = i.id 
        WHERE i.name = ANY($1) 
        GROUP BY r.id, r.name, r.description, r.createdDate, r.modifiedDate, r.user_id 
        HAVING COUNT(DISTINCT i.name) = $2
    `, [ingredients]);
    
    return result.rows;
}

function querySimilarRecipeNames(searchString) {
    const result = pool.query(`
        SELECT * FROM recipe r WHERE (similarity(r.name, $1) > 0.7);
    `, [searchString]);

    return result.rows;
}

export { 
    queryAllIngredients,
    queryRecipesByAnyIngredient,
    queryRecipesByAllIngredients, 
    querySimilarRecipeNames 
}
