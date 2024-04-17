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
    bool_column BOOLEAN,
    date_column DATE,
    datetime_column TIMESTAMP
);

-- Create bin_master
CREATE TABLE IF NOT EXISTS test_schema.bin_master (
    id SERIAL PRIMARY KEY,
    storage_type VARCHAR(255),
    storage_bin VARCHAR(255),
    phase_number VARCHAR(255),
    phase_name VARCHAR(255),
    bin_class VARCHAR(255),
    bin_feature VARCHAR(255),
    reservoir_qty_kg DOUBLE PRECISION,
    primary_pouring_point VARCHAR(255),
    secondary_pouring_point VARCHAR(255),
    filling_point VARCHAR(255),
    if_in_manual VARCHAR(255),
    if_in_cdl VARCHAR(255),
    cdl_drop_number VARCHAR(255),
    if_in_cluster VARCHAR(255),
    cluster_drop_number VARCHAR(255),
    if_in_bulk VARCHAR(255),
    bulk_drop_number VARCHAR(255),
    if_in_kardex VARCHAR(255),
    if_in_hcsd VARCHAR(255),
    hcsd_drop_number VARCHAR(255),
    if_in_sds VARCHAR(255),
    sds_drop_number VARCHAR(255),
    comment VARCHAR(255)
);

-- Create material_master
CREATE TABLE IF NOT EXISTS test_schema.material_master (
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

