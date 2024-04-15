import React, { useState, useEffect, useRef, ChangeEvent } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ColDef, ICellRendererParams, GridApi } from 'ag-grid-community';
import { fetchData, updateData, bulkUpdateData } from '../../api/api';
import { parseXLSX } from '../../utils/xlsxParser';
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";

// Custom cell renderer for the remove button column
const RemoveButtonRenderer = (props: ICellRendererParams) => {
  return <button onClick={() => props.context.handleRemoveRow(props)} disabled={props.context.isFileUploaded}>Remove</button>;
};

// Generic grid component that displays data from the backend
const GenericGrid = ({ tableName }: { tableName: string }) => {
  const [rowData, setRowData] = useState<any[]>([]);
  const [columnDefs, setColumnDefs] = useState<ColDef[]>([]);
  const [changes, setChanges] = useState({});
  const [removedRowIds, setRemovedRowIds] = useState<string[]>([]);
  const [isFileUploaded, setIsFileUploaded] = useState(false);
  const gridApiRef = useRef<GridApi | null>(null);
  const tempId = useRef(-1);  

  // Temporary logs the updated state of rowData whenever it changes
  useEffect(() => {
    console.log("RowData after update:", rowData);
  }, [rowData]); 
  
 // Fetches data from the backend and sets columnDefs whenever tableName changes
  useEffect(() => {
    fetchData(tableName)
      .then(response => {
        const { columns, data } = response;
        setRowData(data);

        const defs: ColDef[] = columns.map((column: any) => {
          let cellDataType;
          switch (column.type) {
            case 'integer':
              cellDataType = 'number';
              break;
            case 'float':
              cellDataType = 'number';
              break;
            case 'varchar':
              cellDataType = 'text';
              break;
            case 'boolean':
              cellDataType = 'boolean';
              break;
            default:
              cellDataType = 'text';
          }

          return {
            headerName: column.name.charAt(0).toUpperCase() + column.name.slice(1),
            field: column.name,
            editable: true,
            filter: true,  
            hide: column.name === 'id',
            cellDataType,  
          };
        });

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
          acc[colDef.field] = colDef.cellDataType === 'boolean' ? false : (colDef.cellDataType === 'text' ? '' : null);
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
    if (isFileUploaded) {
      // If a file has been uploaded, use the bulk-update endpoint
      if (window.confirm("Are you sure you want to perform bulk update? This will clear and replace the database")) {
        try {
          // Since we're doing a bulk update, we use the entire rowData
          await bulkUpdateData(tableName, rowData);
          alert('Bulk update successful!');
          setIsFileUploaded(false); 
          
          // Clear the file input
          const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
          if (fileInput) {
            fileInput.value = '';
          }

        } catch (error) {
          console.error('Failed bulk update:', error);
          alert('Failed to bulk update. Please try again.');
        }
      }
    } else {
      // If no file has been uploaded use update endpoint
      const updatedData = Object.values(changes); 
      try {
        await updateData(tableName, updatedData, removedRowIds); 
        alert('Update successful!');
        setRemovedRowIds([]); 
        setChanges({}); 

      } catch (error) {
        console.error('Failed to update:', error);
        alert('Failed to update. Please try again.');
      }
    }
    // Refetch the data here to ensure the grid reflects the backend state
    setChanges({});
    const refreshedResponse = await fetchData(tableName);
    const { data } = refreshedResponse;
    setRowData(data); 
  };  

  // Parses the uploaded XLSX file and updates the rowData if the format is valid
  const handleFileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files ? event.target.files[0] : null;
    if (!file) return;
  
    const { data, isValid } = await parseXLSX(file, columnDefs);
    if (isValid) {
      console.log("Data:", data);
      setRowData(data);
      console.log("RowData:", rowData);
      setIsFileUploaded(true); 
      setRemovedRowIds([]); 
      setChanges({}); 
    } else {
      alert('Invalid XLSX format for this table.');
      event.target.value = '';
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
        context={{ handleRemoveRow, isFileUploaded }}
        onGridReady={onGridReady} 
      />
      <input type="file" accept=".xlsx" onChange={handleFileUpload} />
      {isFileUploaded && <button onClick={() => window.location.reload()}>Back</button>}
      <button onClick={handleUpdate}>Update</button>
      <button onClick={handleAddRow} disabled={isFileUploaded}>Add Row</button>
    </div>
  );
};

export default GenericGrid;