import React from 'react';
import GenericGrid from '../components/main/GenericGrid';
import { Card, CardContent, Typography } from '@mui/material';

interface TablePageProps {
  tableName: string;
}

export const TablePage: React.FC<TablePageProps> = ({ tableName }) => {
  return (
    <Card style={{ height: '94.9vh', display: 'flex', flexDirection: 'column' }}>
      <CardContent style={{ flex: 1 }}>
        <Typography variant="h6" component="h2" gutterBottom style={{ color: 'grey', marginTop: '20px', marginLeft: '25px'}}>
          <b>{tableName}</b>
        </Typography>
        <GenericGrid tableName={tableName} />
      </CardContent>
    </Card>
  );
};
