import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';

export const HomePage: React.FC = () => {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '95vh' }}>
      <Card variant="outlined" style={{ maxWidth: 400, margin: 'auto' , marginTop: '40px'}}>
        <CardContent>
          <Typography variant="h5" component="h2" marginBottom={'20px'}>
            Welcome to spreadsheet-db
          </Typography>
          <Typography color="textSecondary">
            This is an application allowing users to perform CRUD (Create, Read, Update, and Delete) operations on relational database tables through an excel-like user interface.
          </Typography>
        </CardContent>
      </Card>
    </div>
  );
};
