import React, { useState, useEffect, useRef, ChangeEvent } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ColDef, ICellRendererParams, GridApi } from 'ag-grid-community';
import { fetchData, updateData } from '../../api/api';
import { parseXLSX } from '../../utils/xlsxParser';
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";

// Custom cell renderer for the remove button column
const RemoveButtonRenderer = (props: ICellRendererParams) => {
  return <button onClick={() => props.context.handleRemoveRow(props)}>Remove</button>;
};

// Generic grid component that displays data from the backend
const GenericGrid = ({ tableName }: { tableName: string }) => {
  const [rowData, setRowData] = useState<any[]>([]);
  const [columnDefs, setColumnDefs] = useState<ColDef[]>([]);
  const [changes, setChanges] = useState({});
  const [removedRowIds, setRemovedRowIds] = useState<string[]>([]);
  const gridApiRef = useRef<GridApi | null>(null);
  const tempId = useRef(-1);  

  // Logs the updated state of rowData whenever it changes
  useEffect(() => {
    // This will log the updated state of rowData every time it changes.
    console.log("RowData after update:", rowData);
  }, [rowData]); // Dependency array, re-run this effect when rowData changes.
  
  // Fetches data from the backend and sets columnDefs whenever tableName changes
  useEffect(() => {
    fetchData(tableName)
      .then(response => {
        const { columns, data } = response;
        setRowData(data);
  
        const defs: ColDef[] = columns.map((column: string) => ({
          headerName: column.charAt(0).toUpperCase() + column.slice(1),
          field: column,
          editable: true,
          filter: true,  
          hide: column === 'id',
        }));
  
        defs.push({
          headerName: "Remove",
          field: "remove",
          cellRenderer: RemoveButtonRenderer, 
          editable: false,
          filter: false,
          sortable: false,
        });
  
        setColumnDefs(defs);
        console.log("Set ColumnDefs:", defs);
      })
      .catch(error => console.error('Error:', error));
  }, [tableName]);  

  // Adds a new row to the grid with the current filters applied
  const handleAddRow = () => {
    const filterModel = gridApiRef.current?.getFilterModel();
  
    const newRow = columnDefs.reduce((acc, colDef) => {
      if (colDef.field && colDef.field !== 'id') {
        if (filterModel && filterModel[colDef.field]) {
          acc[colDef.field] = filterModel[colDef.field].filter;
        } else {
          acc[colDef.field] = '';
        }
      } else if (colDef.field === 'id') {
        acc[colDef.field] = tempId.current--;
      }
      return acc;
    }, {} as Record<string, any>);
  
    setRowData(prev => [...prev, newRow]);
  };  
  
  // Removes a row from the grid and adds the id to removedRowIds
  const handleRemoveRow = (params: ICellRendererParams) => {
    const idToRemove = params.data.id;
    setRowData(prev => prev.filter(row => row.id !== idToRemove));
  
    if (idToRemove !== undefined && idToRemove >= 0) {
      setRemovedRowIds(prev => [...prev, idToRemove]);
    }
  
    setChanges(prev => {
      const newChanges: Record<string | number, any> = { ...prev };
      delete newChanges[idToRemove];
      return newChanges;
    });
  };

  // Updates the data in the backend with the changes and provides removedRowIds for deletion
  const handleUpdate = async () => {
    const updatedData = Object.values(changes);
    try {
      await updateData(tableName, updatedData, removedRowIds);
      alert('Updated successfully!');
      setRemovedRowIds([]);
      const refreshedResponse = await fetchData(tableName);
      const { data } = refreshedResponse;
      setRowData(data);
      setChanges({});
    } catch (error) {
      console.error('Failed to update:', error);
      alert('Failed to update. Please try again.');
    }
  };

  // Parses the uploaded XLSX file and updates the rowData if the format is valid
  const handleFileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files ? event.target.files[0] : null;
    if (!file) return;
  
    const { data, isValid } = await parseXLSX(file);
    if (isValid) {
      // Replace the current rowData with the new data
      console.log("Data:", data);
      setRowData(data);
      console.log("RowData:", rowData);
    } else {
      alert('Invalid XLSX format for this table.');
    }
  };
  
  // Updates the changes object whenever a cell value is changed  
  const onCellValueChanged = ({ data }: { data: any }) => {
    setChanges((prev: typeof changes) => ({ ...prev, [data.id]: data }));
  };

  // Required to access the grid API for editing
  const onGridReady = (params: any) => {
    gridApiRef.current = params.api;
  };

  return (
    <div className="ag-theme-quartz" style={{ height: 500 }}>
      <AgGridReact
        rowData={rowData}
        columnDefs={columnDefs}
        onCellValueChanged={onCellValueChanged}
        context={{ handleRemoveRow }}
        onGridReady={onGridReady} 
      />
      <input type="file" accept=".xlsx" onChange={handleFileUpload} />
      <button onClick={handleUpdate}>Update</button>
      <button onClick={handleAddRow}>Add Row</button>
    </div>
  );
};

export default GenericGrid;