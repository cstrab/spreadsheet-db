#!/bin/bash

# Check if three arguments were provided
if [ $# -ne 3 ]; then
    echo "Three arguments required: schema file, database type mapping file, and output file"
    exit 1
fi

# Read the schema.json file and data type mapping file
schema_file=$(cat $1)
database_type_mapping_file=$(cat $2)
output_file=$3

# Use jq to parse the JSON and generate the SQL commands
echo -e "-- Create the schema" > $output_file
echo -e "CREATE SCHEMA IF NOT EXISTS $(echo $schema_file | jq -r .schema_name);\n" >> $output_file

# Loop over the tables
for table in $(echo $schema_file | jq -r '.tables[] | @base64'); do
    # Decode the table JSON
    table=$(echo $table | base64 --decode)

    # Get the table name
    table_name=$(echo $table | jq -r .table_name)

    # Get the database type
    database_type=$(echo $schema_file | jq -r .database_type)

    # Start the CREATE TABLE command
    echo -e "-- Create $table_name" >> $output_file
    echo -e -n "CREATE TABLE IF NOT EXISTS $(echo $schema_file | jq -r .schema_name).$table_name (\n" >> $output_file

    # Loop over the columns
    first_column=true
    for column in $(echo $table | jq -r '.columns[] | @base64'); do
        # Decode the column JSON
        column=$(echo $column | base64 --decode)

        # Get the column name and data type
        column_name=$(echo $column | jq -r .column_name)
        data_type=$(echo $column | jq -r .data_type)

        # Map the data type to a database-specific data type
        data_type=$(echo $database_type_mapping_file | jq -r ".$database_type.$data_type")

        # Add a comma if this is not the first column
        if [ "$first_column" != true ]; then
            echo -e -n ",\n" >> $output_file
        fi

        # Add the column to the CREATE TABLE command
        echo -e -n "    $column_name $data_type" >> $output_file

        first_column=false
    done

    # End the CREATE TABLE command
    echo -e "\n);\n" >> $output_file
done
