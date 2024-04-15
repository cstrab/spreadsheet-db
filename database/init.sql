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

-- Create table_three
CREATE TABLE IF NOT EXISTS test_schema.table_three (
    id SERIAL PRIMARY KEY,
    string_column VARCHAR(255),
    int_column INTEGER,
    float_column DOUBLE PRECISION,
    bool_column BOOLEAN
);

