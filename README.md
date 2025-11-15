# Database documentation

### Filtering by Ingredients:
1. Populate Ingredients filter (when user opens Ingredients filter in search menu)
SELECT * FROM INGREDIENTS

2. When user selects ingredients and searches (OR search)
SELECT * FROM recipe 
INNER JOIN recipe_ingredients 
ON recipe.id = recipe_ingredients.recipe_id
INNER JOIN ingredients
ON recipe_ingredients.ingredients_id = ingredients.id
WHERE ingredients.name = ANY(user_ingredients_param)

3. When user selects ingredients and searches (AND search - must have all ingredients)
SELECT * FROM recipe r
INNER JOIN recipe_ingredients ri
ON r.id = ri.recipe_id
INNER JOIN ingredients i
ON ri.ingredients_id = i.id
WHERE i.name @> ARRAY[user_ingredients_array]
