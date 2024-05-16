#!/bin/bash

# Check if two arguments were provided
if [ $# -ne 2 ]; then
    echo "Two arguments required: schema file and output file"
    exit 1
fi

# Read the schema.json file
schema_file=$(cat $1)
output_file=$2

# Start writing to the Header.tsx file
echo "import React, { useState } from 'react';" > $output_file
echo "import { NavLink, useMatch } from 'react-router-dom';" >> $output_file
echo "import { AppBar, Menu, MenuItem, Stack, Toolbar, Typography } from '@mui/material';" >> $output_file
echo "import '../../assets/sample-logo.png';" >> $output_file
echo "import '../../styles/styles.css';" >> $output_file
echo "" >> $output_file
echo "const VER = process.env.REACT_APP_VERSION ? \` v. \${process.env.REACT_APP_VERSION}\` : \` v. DEV\`;" >> $output_file
echo "" >> $output_file
echo "interface IHeaderProps {" >> $output_file
echo "  pageTitle: string;" >> $output_file
echo "  menu?: JSX.Element;" >> $output_file
echo "  sideLinks?: JSX.Element;" >> $output_file
echo "}" >> $output_file
echo "" >> $output_file
echo "export const Header: React.FC<IHeaderProps> = ({ pageTitle, menu, sideLinks }) => {" >> $output_file
echo "  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);" >> $output_file
echo "" >> $output_file
echo "  const tableMatches = [" >> $output_file

# Dynamic matches based on tables in the schema
for table in $(echo $schema_file | jq -r '.tables[] | @base64'); do
    # Decode the table JSON
    table=$(echo $table | base64 --decode)
    table_name=$(echo $table | jq -r .table_name)
    table_path=$(echo $table_name | tr '_' '-')
    echo "    useMatch({ path: '/$table_path', end: false })," >> $output_file
done

echo "  ].filter(Boolean);" >> $output_file
echo "" >> $output_file
echo "  const isTableActive = tableMatches.length > 0;" >> $output_file
echo "" >> $output_file
echo "  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {" >> $output_file
echo "    setAnchorEl(event.currentTarget);" >> $output_file
echo "  };" >> $output_file
echo "" >> $output_file
echo "  const handleMenuClose = () => {" >> $output_file
echo "    setAnchorEl(null);" >> $output_file
echo "  };" >> $output_file
echo "" >> $output_file
echo "  return (" >> $output_file
echo "    <>" >> $output_file
echo "      <AppBar" >> $output_file
echo "        position=\"fixed\"" >> $output_file
echo "        sx={{" >> $output_file
echo "          background: '#0075cf'," >> $output_file
echo "          display: 'grid'," >> $output_file
echo "          gridTemplateColumns: '50px auto 1fr auto'," >> $output_file
echo "          gap: 'px'," >> $output_file
echo "          height: '60px'," >> $output_file
echo "          padding: '0 15px'," >> $output_file
echo "          alignItems: 'center'," >> $output_file
echo "          color: '#fff'," >> $output_file
echo "          zIndex: (theme) => theme.zIndex.drawer + 1," >> $output_file
echo "          displayPrint: 'none'," >> $output_file
echo "        }}" >> $output_file
echo "        component=\"nav\"" >> $output_file
echo "      >" >> $output_file
echo "        <img src={require('../../assets/sample-logo.png')} alt=\"Logo\" className=\"small-logo\" />" >> $output_file
echo "        <Typography component=\"h1\" variant=\"h6\" style={{ fontWeight: 'bold' }}>" >> $output_file
echo "          {pageTitle}" >> $output_file
echo "          {VER && <small style={{ fontWeight: 'normal', fontSize: '13px', marginRight: '40px' }}>{VER}</small>}" >> $output_file
echo "        </Typography>" >> $output_file
echo "        <Stack direction=\"row\" spacing={2} >" >> $output_file
echo "          <NavLink to=\"/\" className={({ isActive }) => isActive ? \"nav-link-active\" : \"nav-link\"}>" >> $output_file
echo "            Home" >> $output_file
echo "          </NavLink>" >> $output_file
echo "          <div onClick={handleMenuOpen} className={\`nav-link \${isTableActive ? 'nav-link-active' : ''}\`}>Tables</div>" >> $output_file
echo "          <Menu" >> $output_file
echo "            anchorEl={anchorEl}" >> $output_file
echo "            open={Boolean(anchorEl)}" >> $output_file
echo "            onClose={handleMenuClose}" >> $output_file
echo "            anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}" >> $output_file
echo "            transformOrigin={{ vertical: 'top', horizontal: 'left' }}" >> $output_file
echo "          >" >> $output_file

# Dynamically generate MenuItems for each table
for table in $(echo $schema_file | jq -r '.tables[] | @base64'); do
    table=$(echo $table | base64 --decode)
    table_name=$(echo $table | jq -r .table_name)
    display_name=$(echo $table_name | sed -r 's/_/ /g' | awk '{for(i=1;i<=NF;i++) $i=toupper(substr($i,1,1)) tolower(substr($i,2))}1')
    table_path=$(echo $table_name | tr '_' '-')
    echo "            <MenuItem onClick={handleMenuClose}>" >> $output_file
    echo "              <NavLink to=\"/$table_path\" className=\"dropdown-link\">$display_name</NavLink>" >> $output_file
    echo "            </MenuItem>" >> $output_file
done

echo "          </Menu>" >> $output_file
echo "        </Stack>" >> $output_file
echo "      </AppBar>" >> $output_file
echo "      <Toolbar className='header-toolbar' />" >> $output_file
echo "    </>" >> $output_file
echo "  );" >> $output_file
echo "};" >> $output_file
