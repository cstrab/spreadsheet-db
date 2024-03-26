-- Create the schema
CREATE SCHEMA IF NOT EXISTS test_schema;

-- Create table_one
CREATE TABLE IF NOT EXISTS test_schema.table_one (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description VARCHAR(255) NOT NULL
);

-- Create table_two
CREATE TABLE IF NOT EXISTS test_schema.table_two (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    details VARCHAR(255) NOT NULL,
    category VARCHAR(255) NOT NULL
);

-- Insert fake data into table_one
INSERT INTO test_schema.table_one (name, description) VALUES
('Item One', 'Description for Item One'),
('Item Two', 'Description for Item Two'),
('Item Three', 'Description for Item Three');

-- Insert fake data into table_two
INSERT INTO test_schema.table_two (title, details, category) VALUES
('Title One', 'Details for Title One', 'Category A'),
('Title Two', 'Details for Title Two', 'Category B'),
('Title Three', 'Details for Title Three', 'Category C');
