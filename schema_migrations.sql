ALTER TABLE recipe
ADD COLUMN IF NOT EXISTS cook_time SMALLINT,
ADD COLUMN IF NOT EXISTS image_url TEXT;

CREATE OR REPLACE VIEW full_recipe AS
SELECT 
    r.id AS recipe_id,
    r.name,
    r.description AS recipe_description,
    r."createdDate",
    r."image_url",
    r."cook_time",
    r."modifiedDate",

    s.id AS step_id,
    s.step_num,
    s.description AS step_description,

    ri.quantity,
    ri.unit,
    ri.notes,

    i.id AS ingredient_id,
    i.name AS ingredient_name

FROM recipe r 
INNER JOIN steps s 
ON r.id = s.recipe_id
INNER JOIN recipe_ingredients ri
ON r.id = ri.recipe_id
INNER JOIN ingredients i
ON i.id = ri.ingredients_id;