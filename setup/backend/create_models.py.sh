#!/bin/bash

# Function to convert snake case to CamelCase
function snake_to_camel {
    echo $1 | awk 'BEGIN{FS="_";OFS=""}{$1=toupper(substr($1,1,1)) substr($1,2); for(i=2;i<=NF;i++){$i=toupper(substr($i,1,1)) substr($i,2)}; print}'
}

# Check if four arguments were provided
if [ $# -ne 5 ]; then
    echo "Five arguments required: schema file, mapping file, output file, and database type"
    exit 1
fi

# Read the schema.json file and mapping file
schema=$(cat $1)
mapping=$(cat $2)
output_file=$3
database_type=$4
database_mapping_file=$5

# Extract the schema name from the schema file
schema_name=$(echo $schema | jq -r '.schema_name')

# Read the database_mapping.json file
database_mapping=$(cat $database_mapping_file)

# Extract the prefix from the mapping file
prefix=$(echo $database_mapping | jq -r ".$database_type")

# Start the models.py file
echo "import os" > $output_file
echo "" >> $output_file

# Initialize an array to hold the unique data types
declare -a data_types=("Column" "create_engine")

# Loop over the tables to find the unique data types
for table in $(echo $schema | jq -r '.tables[] | @base64'); do
    # Decode the table JSON
    table=$(echo $table | base64 --decode)

    # Loop over the columns to add their data type to the array
    for column in $(echo $table | jq -r '.columns[] | @base64'); do
        # Decode the column JSON
        column=$(echo $column | base64 --decode)

        # Get the data type
        data_type=$(echo $column | jq -r .data_type)

        # Map the data type to a SQLAlchemy data type
        sqlalchemy_type=$(echo $mapping | jq -r ".$data_type")

        # Add the SQLAlchemy data type to the array if it's not already in it
        if [[ ! " ${data_types[@]} " =~ " ${sqlalchemy_type} " ]]; then
            data_types+=("$sqlalchemy_type")
        fi
    done
done

# Convert the array to a comma-separated string with spaces after the commas
imports=$(printf ", %s" "${data_types[@]}")
imports=${imports:2}

# Add the import statement to the file
echo "from sqlalchemy import $imports" >> $output_file
echo "from sqlalchemy.ext.declarative import declarative_base" >> $output_file
echo "from sqlalchemy.orm import sessionmaker" >> $output_file
echo "" >> $output_file
echo "" >> $output_file

# Add the dynamic database type and environment variables to the file
echo "DATABASE_TYPE = '$database_type'" >> $output_file
echo "DATABASE_USER = os.getenv('${prefix}_USER')" >> $output_file
echo "DATABASE_PASSWORD = os.getenv('${prefix}_PASSWORD')" >> $output_file
echo "DATABASE_NAME = os.getenv('${prefix}_DB')" >> $output_file
echo "DATABASE_HOST = os.getenv('${prefix}_HOST')" >> $output_file
echo "DATABASE_PORT = os.getenv('${prefix}_PORT')" >> $output_file
echo "" >> $output_file
echo "Base = declarative_base()" >> $output_file
echo "" >> $output_file

# Loop over the tables to create the classes
for table in $(echo $schema | jq -r '.tables[] | @base64'); do
    # Decode the table JSON
    table=$(echo $table | base64 --decode)

    # Get the table name and convert it to CamelCase for the class names
    table_name=$(echo $table | jq -r .table_name)
    class_name=$(snake_to_camel $table_name)

    # Start the class definition
    echo "class $class_name(Base):" >> $output_file
    echo "    __tablename__ = '$table_name'" >> $output_file
    echo "    __table_args__ = {'schema': '$schema_name'}" >> $output_file

    # Loop over the columns to add them to the class
    for column in $(echo $table | jq -r '.columns[] | @base64'); do
        # Decode the column JSON
        column=$(echo $column | base64 --decode)

        # Get the column name and data type
        column_name=$(echo $column | jq -r .column_name)
        data_type=$(echo $column | jq -r .data_type)

        # Map the data type to a SQLAlchemy data type
        data_type=$(echo $mapping | jq -r ".$data_type")

        # Check if the column is a primary key
        if [ "$column_name" = "id" ]; then
            echo "    $column_name = Column($data_type, primary_key=True, index=True)" >> $output_file
        else
            echo "    $column_name = Column($data_type, index=True)" >> $output_file
        fi
    done

    echo "" >> $output_file
done

echo "DATABASE_URL = f\"{DATABASE_TYPE}://{DATABASE_USER}:{DATABASE_PASSWORD}@{DATABASE_HOST}:{DATABASE_PORT}/{DATABASE_NAME}\"" >> $output_file
echo "" >> $output_file
echo "engine = create_engine(DATABASE_URL)" >> $output_file
echo "SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)" >> $output_file
echo "" >> $output_file
echo "def init_db():" >> $output_file
echo "    Base.metadata.create_all(bind=engine)" >> $output_file
