ALTER TABLE recipe
ADD COLUMN IF NOT EXISTS cook_time SMALLINT,
ADD COLUMN IF NOT EXISTS image_url TEXT;

ALTER TABLE tag
ALTER COLUMN name SET NOT NULL
ADD CONSTRAINT unique_tag_name UNIQUE (name);
CREATE UNIQUE INDEX tag_name_lower_idx ON tag (LOWER(name));

-- Add the new column
ALTER TABLE recipe ADD COLUMN IF NOT EXISTS tsv TSVECTOR;

-- Populate the column with data from 'name' and 'description'
UPDATE recipe SET tsv = 
  TO_TSVECTOR('english', name) || 
  TO_TSVECTOR('english', description);

-- Create a GIN index for fast searching
CREATE INDEX IF NOT EXISTS recipe_tsv_idx ON recipe USING GIN (tsv);

-- Optional: Create a trigger to keep the tsv column updated automatically
CREATE OR REPLACE FUNCTION recipe_tsv_trigger() RETURNS trigger AS $$
BEGIN
  NEW.tsv :=
    TO_TSVECTOR('english', NEW.name) ||
    TO_TSVECTOR('english', NEW.description);
  RETURN NEW;
END
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER tsvupdate BEFORE INSERT OR UPDATE
ON recipe FOR EACH ROW EXECUTE FUNCTION recipe_tsv_trigger();

DROP VIEW IF EXISTS full_recipe;

CREATE VIEW full_recipe AS
WITH recipe_stats AS (
    SELECT 
        recipe_id,
        TRUNC(AVG(rating), 2) AS average_rating,
        COUNT(id) AS total_ratings
    FROM review
    GROUP BY recipe_id
)
SELECT 
    r.id AS recipe_id,
    r.name,
    r.description AS recipe_description,
    r."createdDate",
    r."image_url",
    r."cook_time",
    r."modifiedDate",
    r.tsv,

    s.id AS step_id,
    s.step_num,
    s.description AS step_description,

    ri.quantity,
    ri.unit,
    ri.notes,

    i.id AS ingredient_id,
    i.name AS ingredient_name,

    t.id AS tag_id,
    t.name AS tag_name,

    rs.average_rating,
    rs.total_ratings

FROM recipe r 
INNER JOIN steps s 
ON r.id = s.recipe_id
INNER JOIN recipe_ingredients ri
ON r.id = ri.recipe_id
INNER JOIN ingredients i
ON i.id = ri.ingredients_id
LEFT JOIN recipe_tags rt
ON r.id = rt.recipe_id
LEFT JOIN tag t
ON t.id = rt.tag_id
LEFT JOIN recipe_stats rs
ON r.id = rs.recipe_id;

CREATE OR REPLACE VIEW recipe_reviews AS
SELECT
    rv.id AS review_id,
    rv.recipe_id AS recipe_id,
    rv.rating,
    rv.user_id,
    rv.comment

FROM recipe r
INNER JOIN review rv
ON r.id = rv.recipe_id;