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
WHERE i.name in ARRAY[user_ingredients_array];

3. When user selects ingredients and searches (AND search - must have all ingredients)
SELECT * FROM recipe r
INNER JOIN recipe_ingredients ri
ON r.id = ri.recipe_id
INNER JOIN ingredients i
ON ri.ingredients_id = i.id
WHERE i.name in ARRAY[user_ingredients_array]
HAVING COUNT(DISTINCT i.name) = 3;
