-- Create the schema
CREATE SCHEMA IF NOT EXISTS sample_schema;

-- Create sample_table_types
CREATE TABLE IF NOT EXISTS sample_schema.sample_table_types (
    id SERIAL PRIMARY KEY,
    string_column VARCHAR(255),
    int_column INTEGER,
    float_column DOUBLE PRECISION,
    bool_column BOOLEAN,
    date_column DATE,
    datetime_column TIMESTAMP
);

-- Create sample_table_users
CREATE TABLE IF NOT EXISTS sample_schema.sample_table_users (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    email VARCHAR(255),
    city VARCHAR(255),
    state VARCHAR(255),
    zip INTEGER,
    age INTEGER,
    date_created DATE,
    is_active BOOLEAN
);

