import React from 'react';
import { ReactGrid, Column, Row, CellChange, TextCell, HeaderCell, Id } from '@silevis/reactgrid'; 
import axios from 'axios';
import '@silevis/reactgrid/styles.css';

const API_HOST = process.env.REACT_APP_API_HOST || 'localhost';
const API_PORT = process.env.REACT_APP_API_PORT || '8000';

interface GenericGridProps {
  getEndpointTable: string;
  updateEndpointTable: string;
}

export const GenericGrid: React.FC<GenericGridProps> = ({ getEndpointTable, updateEndpointTable }) => {
  const getEndpoint = `http://${API_HOST}:${API_PORT}${getEndpointTable}`;
  const updateEndpoint = `http://${API_HOST}:${API_PORT}${updateEndpointTable}`;

  const [data, setData] = React.useState<any[]>([]); 
  const [columns, setColumns] = React.useState<Column[]>([]);
  const [rows, setRows] = React.useState<Row[]>([]);

  React.useEffect(() => {
    axios.get(getEndpoint)
      .then(response => {
        setData(response.data);
        if (response.data.length > 0) {
          const item = response.data[0];
          const cols = Object.keys(item).sort((a, b) => a === 'id' ? -1 : b === 'id' ? 1 : 0).map(key => ({ columnId: key.toString(), width: 150, resizable: true })); 
          setColumns(cols);
        }
      })
      .catch(error => console.error('Failed to fetch data:', error));
  }, [getEndpoint]);

  React.useEffect(() => {
    const headerRow: Row<HeaderCell> = {
      rowId: 'header',
      cells: columns.map(column => ({ type: 'header', text: column.columnId.toString() })), 
    };

    const dataRows: Row<TextCell>[] = data.map((item, idx) => ({
      rowId: `item-${idx}`,
      cells: columns.map(column => ({ 
        type: 'text', 
        text: item[column.columnId] !== undefined && item[column.columnId] !== null ? item[column.columnId].toString() : '', 
        columnId: column.columnId 
      })),
    }));    

    setRows([headerRow, ...dataRows]);
  }, [data, columns]);

  const handleCellsChanged = (changes: CellChange[]) => {
    const textCellChanges = changes.filter(change => change.newCell.type === 'text') as CellChange<TextCell>[];

    setData((prevData: any[]) => { 
      return prevData.map((item, idx) => {
        const change = textCellChanges.find(change => change.rowId === `item-${idx}`);
        if (change && change.newCell.type === 'text' && typeof item === 'object') { 
          return { ...item, [change.columnId]: change.newCell.text };
        }
        return item;
      });
    });
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
      await axios.put(updateEndpoint, { data: data });
      alert('Updated successfully!');
    } catch (error) {
      console.error('Failed to update:', error);
      alert('Failed to update.');
    }
  };

  return (
    <>
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
