import React from 'react';
import GenericGrid from '../components/main/GenericGrid';

interface TablePageProps {
  tableName: string;
}

export const TablePage: React.FC<TablePageProps> = ({ tableName }) => {
  return (
    <GenericGrid tableName={tableName} />
  );
};
