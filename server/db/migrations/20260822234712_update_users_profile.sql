-- migrate:up
ALTER TABLE users RENAME COLUMN name TO display_name;
ALTER TABLE users ADD COLUMN country text;
ALTER TABLE users DROP COLUMN avatar_emoji;
ALTER TABLE users DROP COLUMN avatar_bg;

-- migrate:down
ALTER TABLE users ADD COLUMN avatar_emoji character varying(8) NOT NULL DEFAULT '';
ALTER TABLE users ADD COLUMN avatar_bg character varying(16) NOT NULL DEFAULT '';
ALTER TABLE users DROP COLUMN country;
ALTER TABLE users RENAME COLUMN display_name TO name;
