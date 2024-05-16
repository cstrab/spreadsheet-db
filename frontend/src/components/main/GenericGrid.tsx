import React, { useState, useEffect } from 'react';
import { AgGridReact } from 'ag-grid-react';
import useGrid from '../../hooks/useGrid';
import LoadingOverlay from '../common/LoadingOverlay';
import { CardContent, Button } from '@mui/material';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import '../../styles/styles.css';

const GenericGrid = ({ tableName }: { tableName: string }) => {
  const {
    rowData,
    columnDefs,
    isLoading,
    isFileUploaded,
    handleAddRow,
    handleRemoveRow,
    handleUpdate,
    handleFileUpload,
    onCellValueChanged,
    gridApiRef,
  } = useGrid(tableName);

  const [rowCount, setRowCount] = useState(rowData.length);
  const [gridHeight, setGridHeight] = useState('70vh'); 

  useEffect(() => {
    setRowCount(rowData.length);

    const handleResize = () => {
      setGridHeight(`${window.innerHeight * 0.70}px`); 
    };

    window.addEventListener('resize', handleResize);
    handleResize(); 

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [rowData]);

  const handleFilterChanged = () => {
    const filteredRows = gridApiRef.current?.getDisplayedRowCount();
    setRowCount(filteredRows || 0);
  };

  const onGridReady = (params: any) => {
    gridApiRef.current = params.api;
    params.api.addEventListener('filterChanged', handleFilterChanged);
  };

  return (
    <CardContent>
      <div className="ag-theme-quartz" style={{ height: gridHeight }}>
        <LoadingOverlay isLoading={isLoading} />
        <AgGridReact
          rowData={rowData}
          columnDefs={columnDefs}
          onCellValueChanged={onCellValueChanged}
          context={{ handleRemoveRow, isFileUploaded }}
          onGridReady={onGridReady}
          onFilterChanged={handleFilterChanged}
        />
        <div style={{ margin: 15 }}>
          Displaying {rowCount} of {rowData.length} rows
        </div>
        <input type="file" accept=".xlsx" onChange={handleFileUpload} />
        {isFileUploaded && (
          <Button onClick={() => window.location.reload()}>Back</Button>
        )}
        <Button onClick={handleUpdate}>Update</Button>
        <Button onClick={handleAddRow} disabled={isFileUploaded}>
          Add Row
        </Button>
      </div>
    </CardContent>
  );
};

export default GenericGrid;
