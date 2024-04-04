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
schema_file=$(cat $1)
output_file=$2

# Start the Python file
echo "from typing import List, Optional, Union" > $output_file
echo "" >> $output_file
echo "from pydantic import BaseModel, validator" >> $output_file
echo "" >> $output_file
echo "from utils.logger import setup_logger" >> $output_file
echo "" >> $output_file
echo "" >> $output_file
echo "logger = setup_logger('backend')" >> $output_file
echo "" >> $output_file

# Loop over the tables to create the classes
for table in $(echo $schema_file | jq -r '.tables[] | @base64'); do
    # Decode the table JSON
    table=$(echo $table | base64 --decode)

    # Get the table name and convert it to CamelCase for the class names
    table_name=$(echo $table | jq -r .table_name)
    class_name=$(snake_to_camel $table_name)

    # Start the class definitions
    echo "# Schemas for $class_name" >> $output_file
    echo "class ${class_name}Base(BaseModel):" >> $output_file

    # Loop over the columns to add them to the class
    for column in $(echo $table | jq -r '.columns[] | @base64'); do
        # Decode the column JSON
        column=$(echo $column | base64 --decode)

        # Get the column name and data type
        column_name=$(echo $column | jq -r .column_name)
        data_type=$(echo $column | jq -r .data_type)

        # Skip the id column
        if [ "$column_name" != "id" ]; then
            # Add the column to the class
            echo "    $column_name: Optional[$data_type]" >> $output_file
        fi
    done

    echo "" >> $output_file
    echo "class ${class_name}Update(BaseModel):" >> $output_file
    echo "    id: Optional[int] = None" >> $output_file

    # Loop over the columns to add them to the class
    for column in $(echo $table | jq -r '.columns[] | @base64'); do
        # Decode the column JSON
        column=$(echo $column | base64 --decode)

        # Get the column name and data type
        column_name=$(echo $column | jq -r .column_name)
        data_type=$(echo $column | jq -r .data_type)

        # Skip the id column
        if [ "$column_name" != "id" ]; then
            # Add the column to the class
            echo "    $column_name: Optional[$data_type] = None" >> $output_file
        fi
    done

    echo "" >> $output_file
    echo "class ${class_name}Read(${class_name}Base):" >> $output_file
    echo "    id: int" >> $output_file
    echo "" >> $output_file
    echo "class ${class_name}ListUpdate(BaseModel):" >> $output_file
    echo "    data: List[${class_name}Update]" >> $output_file
    echo "" >> $output_file
done

# Add the Read and Update classes to the file
echo "# Schema for read operations" >> $output_file
echo "class Read(BaseModel):" >> $output_file
echo "    table_name: str" >> $output_file
echo "    skip: int = 0" >> $output_file
echo "    limit: int = 100" >> $output_file
echo "" >> $output_file
echo "# Schema for update operations" >> $output_file
echo "class Update(BaseModel):" >> $output_file
echo "    table_name: str" >> $output_file
echo "    updates: Union[" >> $output_file

# Loop over the tables to add them to the Union
for table in $(echo $schema_file | jq -r '.tables[] | @base64'); do
    # Decode the table JSON
    table=$(echo $table | base64 --decode)

    # Get the table name and convert it to CamelCase for the class names
    table_name=$(echo $table | jq -r .table_name)
    class_name=$(snake_to_camel $table_name)

    # Add the table to the Union
    echo "        ${class_name}ListUpdate," >> $output_file
done

echo "    ]" >> $output_file
echo "    removed_row_ids: List[int]" >> $output_file
echo "" >> $output_file
echo "    @validator('updates', pre=True)" >> $output_file
echo "    def set_updates(cls, v, values):" >> $output_file
echo "        table_name = values.get('table_name')" >> $output_file

# Initialize a variable to keep track of the first table
first_table=true

# Loop over the tables to add them to the validator
for table in $(echo $schema_file | jq -r '.tables[] | @base64'); do
    # Decode the table JSON
    table=$(echo $table | base64 --decode)

    # Get the table name and convert it to CamelCase for the class names
    table_name=$(echo $table | jq -r .table_name)
    class_name=$(snake_to_camel $table_name)

    # Check if this is the first table
    if $first_table ; then
        echo "        if table_name == '$table_name':" >> $output_file
        first_table=false
    else
        echo "        elif table_name == '$table_name':" >> $output_file
    fi

    # Add the table to the validator
    echo "            logger.info(\"Using ${class_name}ListUpdate schema for updates\")" >> $output_file
    echo "            return ${class_name}ListUpdate(**v)" >> $output_file
done

echo "        else:" >> $output_file
echo "            logger.error(f\"Invalid table_name: {table_name}\")" >> $output_file
echo "            raise ValueError('Invalid table_name')" >> $output_file
