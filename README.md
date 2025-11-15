# Database documentation

### Filtering by Ingredients:
1. Populate Ingredients filter (when user opens Ingredients filter in search menu)

SELECT * FROM INGREDIENTS;

2. When user selects ingredients and searches (OR search)
SELECT * FROM recipe r
INNER JOIN recipe_ingredients ri
ON r.id = ri.recipe_id
INNER JOIN ingredients i
ON ri.ingredients_id = i.id
WHERE i.name IN (user_ingredients_array);

3. When user selects ingredients and searches (AND search - must have all ingredients)
SELECT 
    r.* -- Select all recipe columns (must be included in GROUP BY)
FROM 
    recipe r
INNER JOIN 
    recipe_ingredients ri ON r.id = ri.recipe_id
INNER JOIN 
    ingredients i ON ri.ingredients_id = i.id
WHERE 
    i.name = ANY(:user_ingredients_array) -- Filter to only the selected items
GROUP BY 
    	r.id, r.name, r.description, r.createdDate, r.modifiedDate, r.user_id
    -- MUST group by all non-aggregated columns from the SELECT list (r.*)
HAVING 
    COUNT(DISTINCT i.name) = :count_of_user_ingredients; -- Replace parameter with the count

4. Searching for recipes
SELECT * FROM recipe r
WHERE (similarity(r.name, 'search_term') > 0.7);
