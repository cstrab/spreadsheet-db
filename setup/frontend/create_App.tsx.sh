#!/bin/bash

# Check if two arguments were provided
if [ $# -ne 2 ]; then
    echo "Two arguments required: schema file and output file"
    exit 1
fi

# Read the schema.json file
schema_file=$(cat $1)
output_file=$2

# Start the App.tsx file
echo "import React from 'react';" > $output_file
echo "import './styles/styles.css';" >> $output_file
echo "import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';" >> $output_file
echo "import { HomePage } from './pages/HomePage';" >> $output_file
echo "import { TablePage } from './pages/TablePage';" >> $output_file
echo "" >> $output_file
echo "const App: React.FC = () => {" >> $output_file
echo "  return (" >> $output_file
echo "    <Router>" >> $output_file
echo "      <Routes>" >> $output_file
echo "        <Route path=\"/\" element={<HomePage />} />" >> $output_file

# Loop over the tables
for table in $(echo $schema_file | jq -r '.tables[] | @base64'); do
    # Decode the table JSON
    table=$(echo $table | base64 --decode)

    # Get the table name
    table_name=$(echo $table | jq -r .table_name)

    # Convert underscores to hyphens for the path
    table_path=$(echo $table_name | tr '_' '-')

    # Add the table route to the App.tsx file
    echo "        <Route path=\"/$table_path\" element={<TablePage tableName=\"$table_name\" />} />" >> $output_file
done

# End the App.tsx file
echo "      </Routes>" >> $output_file
echo "    </Router>" >> $output_file
echo "  );" >> $output_file
echo "};" >> $output_file
echo "" >> $output_file
echo "export default App;" >> $output_file
