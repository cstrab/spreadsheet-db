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

-- Create material_master
CREATE TABLE IF NOT EXISTS sample_schema.material_master (
    id SERIAL PRIMARY KEY,
    plant VARCHAR(255),
    material VARCHAR(255),
    description VARCHAR(255),
    flashpoint INTEGER,
    is_automation_possible VARCHAR(255),
    low_flashpoint VARCHAR(255),
    crystal VARCHAR(255),
    crystalizes VARCHAR(255),
    citrus VARCHAR(255),
    refrigerate VARCHAR(255),
    nitrogen VARCHAR(255),
    heated VARCHAR(255),
    difficult_heat VARCHAR(255),
    mix_well VARCHAR(255),
    viscous VARCHAR(255),
    slightly_viscous VARCHAR(255),
    solid VARCHAR(255),
    solidifies VARCHAR(255),
    separates VARCHAR(255),
    stench VARCHAR(255),
    moss_oleo_resins VARCHAR(255),
    wax VARCHAR(255),
    special_handling VARCHAR(255),
    plastic_storage VARCHAR(255),
    supply_issue VARCHAR(255),
    phantom VARCHAR(255),
    additional_comments VARCHAR(255)
);

