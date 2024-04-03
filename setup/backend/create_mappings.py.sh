#!/bin/bash

# Function to convert snake case to CamelCase
function snake_to_camel {
    echo $1 | awk 'BEGIN{FS="_";OFS=""}{$1=toupper(substr($1,1,1)) substr($1,2); for(i=2;i<=NF;i++){$i=toupper(substr($i,1,1)) substr($i,2)}; print}'
}

# Check if two arguments were provided
if [ $# -ne 2 ]; then
    echo "Two arguments required: schema file and output file"
    exit 1
fi

# Read the schema.json file
schema=$(cat $1)
output_file=$2

# Start the mappings.py file
echo "from typing import Dict, Type, Any" > $output_file

# Initialize the model and schema names strings
model_names="Base, "
schema_names=""

# Loop over the tables to accumulate the model and schema names
for table in $(echo $schema | jq -r '.tables[] | @base64'); do
    # Decode the table JSON
    table=$(echo $table | base64 --decode)

    # Get the table name and convert it to CamelCase for the class names
    table_name=$(echo $table | jq -r .table_name)
    class_name=$(snake_to_camel $table_name)

    # Add the model and schema names to the strings
    model_names+="$class_name, "
    schema_names+="    ${class_name}Read, ${class_name}Update, ${class_name}ListUpdate, \n"
done

# Remove the trailing comma and space from the model names string
model_names=${model_names%??}

# Add the model and schema imports to the file
echo "from models.models import $model_names" >> $output_file
echo "from models.schemas import (" >> $output_file
echo -e "$schema_names)" >> $output_file

echo "" >> $output_file
echo "TABLE_MODEL_MAPPING: Dict[str, Type[Base]] = {" >> $output_file

# Loop over the tables to add them to the TABLE_MODEL_MAPPING
for table in $(echo $schema | jq -r '.tables[] | @base64'); do
    # Decode the table JSON
    table=$(echo $table | base64 --decode)

    # Get the table name and convert it to CamelCase for the class names
    table_name=$(echo $table | jq -r .table_name)
    class_name=$(snake_to_camel $table_name)

    # Add the table to the TABLE_MODEL_MAPPING
    echo "    \"$table_name\": $class_name," >> $output_file
done

echo "}" >> $output_file
echo "" >> $output_file
echo "TABLE_SCHEMA_MAPPING: Dict[str, Dict[str, Any]] = {" >> $output_file

# Loop over the tables to add them to the TABLE_SCHEMA_MAPPING
for table in $(echo $schema | jq -r '.tables[] | @base64'); do
    # Decode the table JSON
    table=$(echo $table | base64 --decode)

    # Get the table name and convert it to CamelCase for the class names
    table_name=$(echo $table | jq -r .table_name)
    class_name=$(snake_to_camel $table_name)

    # Add the table to the TABLE_SCHEMA_MAPPING
    echo "    \"$table_name\": {" >> $output_file
    echo "        \"read\": ${class_name}Read," >> $output_file
    echo "        \"update\": ${class_name}Update," >> $output_file
    echo "        \"list_update\": ${class_name}ListUpdate," >> $output_file
    echo "    }," >> $output_file
done

echo "}" >> $output_file
