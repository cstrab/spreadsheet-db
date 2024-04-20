-- Create the schema
CREATE SCHEMA IF NOT EXISTS sample_schema;

-- Create sample_table
CREATE TABLE IF NOT EXISTS sample_schema.sample_table (
    id SERIAL PRIMARY KEY,
    string_column VARCHAR(255),
    int_column INTEGER,
    float_column DOUBLE PRECISION,
    bool_column BOOLEAN,
    date_column DATE,
    datetime_column TIMESTAMP
);

