-- Create the schema
CREATE SCHEMA IF NOT EXISTS test_schema;

-- Create table_one
CREATE TABLE IF NOT EXISTS test_schema.table_one (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    description VARCHAR(255)
);

-- Create table_two
CREATE TABLE IF NOT EXISTS test_schema.table_two (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255),
    details VARCHAR(255),
    category VARCHAR(255)
);

-- Insert fake data into table_one
INSERT INTO test_schema.table_one (name, description) VALUES
('banana', 'a yellow fruit'),
('apple', 'a red fruit with seeds'),
('kiwi', 'a small green fruit with seeds');

-- Insert fake data into table_two
INSERT INTO test_schema.table_two (title, details, category) VALUES
('star wars', 'a film with lightsabers', 'sci-fi'),
('harry potter', 'a film about a wizard', 'fantasy'),
('lord of the rings', 'a film about a ring', 'fantasy'),
('the matrix', 'a film about a computer hacker', 'sci-fi');