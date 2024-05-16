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
echo "from typing import List, Optional, Union, Any, Dict, Type" > $output_file
echo "from datetime import date, datetime" >> $output_file
echo "" >> $output_file
echo "from pydantic import BaseModel, validator, ValidationError" >> $output_file
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

# Add the Update classes to the file
echo "# Function to validate update data based on table_name" >> $output_file
echo "def validate_update_data(v: Any, table_name: str, model_mapping: Dict[str, Type[BaseModel]]) -> Any:" >> $output_file
echo "    if table_name in model_mapping:" >> $output_file
echo "        schema = model_mapping[table_name]" >> $output_file
echo "        try:" >> $output_file
echo "            return schema(**v)" >> $output_file
echo "        except ValidationError as e:" >> $output_file
echo "            logger.error(f\"Invalid update data for table {table_name}: {e}\")" >> $output_file
echo "            raise ValueError(f\"Invalid update data for table {table_name}: {e}\")" >> $output_file
echo "    else:" >> $output_file
echo "        logger.error(f\"Table not found in mappings: {table_name}\")" >> $output_file
echo "        raise ValueError(f\"Table not found in mappings: {table_name}\")" >> $output_file
echo "" >> $output_file
echo "# Schema for bulk update operations" >> $output_file
echo "class BulkUpdate(BaseModel):" >> $output_file
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
echo "" >> $output_file
echo "    @validator('updates', pre=True)" >> $output_file
echo "    def set_updates(cls, v, values):" >> $output_file
echo "        table_name = values.get('table_name')" >> $output_file
echo "        logger.info(f\"Validating bulk updates for table: {table_name}\")" >> $output_file
echo "        return validate_update_data(v, table_name, {" >> $output_file

# Loop over the tables to add them to the validator
for table in $(echo $schema_file | jq -r '.tables[] | @base64'); do
    # Decode the table JSON
    table=$(echo $table | base64 --decode)

    # Get the table name and convert it to CamelCase for the class names
    table_name=$(echo $table | jq -r .table_name)
    class_name=$(snake_to_camel $table_name)

    # Add the table to the validator
    echo "            '${table_name}': ${class_name}ListUpdate," >> $output_file
done

echo "        })" >> $output_file
echo "" >> $output_file
echo "# Schema for update operations" >> $output_file
echo "class Update(BulkUpdate):" >> $output_file
echo "    removed_row_ids: List[int]" >> $output_file
