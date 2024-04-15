#!/bin/bash

# Check if two arguments were provided
if [ $# -ne 2 ]; then
    echo "Two arguments required: schema file and output file"
    exit 1
fi

# Read the schema.json file
schema_file=$(cat $1)
output_file=$2

# Start the HomePage.tsx file
echo "import React from 'react';" > $output_file
echo "import { Link } from 'react-router-dom';" >> $output_file
echo "" >> $output_file
echo "export const HomePage: React.FC = () => {" >> $output_file
echo "  return (" >> $output_file
echo "    <div>" >> $output_file
echo "      <h1>Home Page</h1>" >> $output_file
echo "      <nav>" >> $output_file
echo "        <ul>" >> $output_file

# Loop over the tables
for table in $(echo $schema_file | jq -r '.tables[] | @base64'); do
    # Decode the table JSON
    table=$(echo $table | base64 --decode)

    # Get the table name
    table_name=$(echo $table | jq -r .table_name)

    # Convert table_name to Title Case and replace underscores with spaces for display
    table_name_display=$(echo $table_name | awk -F"_" '{for(i=1;i<=NF;i++)sub(/./,toupper(substr($i,1,1)),$i)}1' OFS=" ")

    # Replace underscores with hyphens for the to prop
    table_name_link=$(echo $table_name | tr '_' '-')

    # Add the table link to the HomePage.tsx file
    echo "          <li>" >> $output_file
    echo "            <Link to=\"/$table_name_link\">$table_name_display</Link>" >> $output_file
    echo "          </li>" >> $output_file
done

# End the HomePage.tsx file
echo "        </ul>" >> $output_file
echo "      </nav>" >> $output_file
echo "    </div>" >> $output_file
echo "  );" >> $output_file
echo "};" >> $output_file
