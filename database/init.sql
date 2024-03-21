CREATE SCHEMA test_schema;

CREATE TABLE test_schema.items (
    ID SERIAL PRIMARY KEY,
    Name VARCHAR(255) NOT NULL,
    Description VARCHAR(255) NOT NULL
);
