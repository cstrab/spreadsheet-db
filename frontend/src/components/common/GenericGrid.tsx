import React, { useEffect, useState } from 'react';
import { ReactGrid, Column, Row, CellChange, TextCell, HeaderCell, Id } from '@silevis/reactgrid'; 
import axios from 'axios';
import '@silevis/reactgrid/styles.css';

const API_HOST = process.env.REACT_APP_API_HOST || 'localhost';
const API_PORT = process.env.REACT_APP_API_PORT || '8000';

interface GenericGridProps {
  tableName: string; 
}

export const GenericGrid: React.FC<GenericGridProps> = ({ tableName }) => {
  const [data, setData] = useState<any[]>([]); 
  const [columns, setColumns] = useState<Column[]>([]);
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.post(`http://${API_HOST}:${API_PORT}/read`, { table_name: tableName });
        setData(response.data);
        if (response.data.length > 0) {
          const item = response.data[0];
          const cols = Object.keys(item).map(key => ({
            columnId: key, 
            width: 150,
            resizable: true
          })).filter(column => column.columnId !== 'id') 
          .sort((a, b) => a.columnId === 'id' ? -1 : b.columnId === 'id' ? 1 : 0);
          setColumns(cols);
        }        
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };

    fetchData();
  }, [tableName]); 

  useEffect(() => {
    const headerRow: Row<HeaderCell> = {
      rowId: 'header',
      cells: columns.map(column => ({ type: 'header', text: column.columnId.toString() })), 
    };

    const dataRows: Row<TextCell>[] = data.map((item, idx) => ({
      rowId: `item-${idx}`,
      cells: columns.map(column => ({ 
        type: 'text' as const,
        text: item[column.columnId] !== undefined && item[column.columnId] !== null ? item[column.columnId].toString() : '', 
        columnId: column.columnId 
      })).filter(cell => cell.columnId !== 'id'), 
    }));       

    setRows([headerRow, ...dataRows]);
  }, [data, columns]);

  const handleCellsChanged = (changes: CellChange[]) => {
    const textCellChanges = changes.filter(change => change.newCell.type === 'text') as CellChange<TextCell>[];

    setData(prevData => prevData.map((item, idx) => {
      const change = textCellChanges.find(change => change.rowId === `item-${idx}`);
      if (change && change.newCell.type === 'text' && typeof item === 'object' && change.columnId !== 'id') { 
        return { ...item, [change.columnId]: change.newCell.text };
      }
      return item;
    }));    
  };

  const handleColumnResize = (columnId: Id, width: number) => { 
    setColumns(prevColumns => {
      const columnIndex = prevColumns.findIndex(column => column.columnId === columnId);
      const updatedColumn = { ...prevColumns[columnIndex], width };
      return [...prevColumns.slice(0, columnIndex), updatedColumn, ...prevColumns.slice(columnIndex + 1)];
    });
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        table_name: tableName,
        updates: { 
          data: data
        }
      };
  
      await axios.post(`http://${API_HOST}:${API_PORT}/update`, payload);
      alert('Updated successfully!');
    } catch (error) {
      console.error('Failed to update:', error);
      alert('Failed to update.');
    }
  };  

  return (
    <>
      <h1>{tableName}</h1>
      <ReactGrid 
        rows={rows} 
        columns={columns} 
        onCellsChanged={handleCellsChanged} 
        onColumnResized={handleColumnResize} 
        stickyTopRows={1}
      /> 
      <button onClick={handleSubmit}>
        Update
      </button>
    </>
  );
};
