import React, { useState, useEffect, useRef, ChangeEvent } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ColDef, ICellRendererParams, GridApi, CellValueChangedEvent } from 'ag-grid-community';
import { fetchData, updateData, bulkUpdateData } from '../../api/api';
import { parseXLSX } from '../../utils/xlsxParser';
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import '../../styles/styles.css'

interface ExtendedColDef extends ColDef {
  cellDataType?: 'number' | 'text' | 'boolean'; 
  cellDataTypeAPI?: string;
}

// Custom cell renderer for the remove button column
const RemoveButtonRenderer = (props: ICellRendererParams) => {
  return <button onClick={() => props.context.handleRemoveRow(props)} disabled={props.context.isFileUploaded}>Remove</button>;
};

// Ensure `checkInvalidCell` function handles string type correctly
const checkInvalidCell = (value: any, type: string): boolean => {
  console.log(`Checking value: ${value}, Type: ${type}`); 
  if (value === null) {
    // Assuming null is allowed initially for any type
    return false;
  }

  switch (type) {
    case 'integer':
      return !Number.isInteger(Number(value));
    case 'float':
      return isNaN(Number(value));
    case 'varchar':
      return typeof value !== 'string';
    case 'boolean':
      return typeof value !== 'boolean' && value !== 'true' && value !== 'false';
    default:
      return false;
  }
};

const checkRowValidity = (row: any, columns: ExtendedColDef[]): boolean => {
  console.log(`Checking validity for row:`, row);  // Log the entire row being processed
  const invalidReasons: any = [];  // Store reasons for any invalid fields
  console.log("Columns:", columns)

  const isValidRow = columns.every(column => {
    // Ensure column.field is defined to satisfy TypeScript's index type requirement
    if (typeof column.field === 'undefined') {
      console.log("Column field is undefined, skipping this column.");
      return true;  // Skip this iteration as we can't check a column without a field name
    }

    // Check and log control fields (usually these fields don't need validation)
    if (column.field === 'id' || column.field === 'isValid' || column.field === 'remove') {
      console.log(`Skipping validation for control field: ${column.field}`);
      return true; // Skip checking our control fields
    }

    // Handle column.type for both string and string[] scenarios
    const columnType = column.cellDataTypeAPI;
    if (columnType) {
      const isValid = !checkInvalidCell(row[column.field], columnType);
      if (!isValid) {
        invalidReasons.push(`Field '${column.field}' with value '${row[column.field]}' is invalid for type '${columnType}'.`);
      }
      return isValid;
    } else {
      invalidReasons.push(`Field '${column.field}' is missing a type definition.`);
      return false;
    }
  });

  if (!isValidRow) {
    console.log(`Row is invalid. Reasons:`, invalidReasons);
  } else {
    console.log(`Row is valid.`);
  }

  return isValidRow;
};

// Generic grid component that displays data from the backend
const GenericGrid = ({ tableName }: { tableName: string }) => {
  const [rowData, setRowData] = useState<any[]>([]);
  const [columnDefs, setColumnDefs] = useState<ExtendedColDef[]>([]);
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
  
        // Update row data to include the validity check
        const processedData = data.map((row: any) => ({
          ...row,
          isValid: checkRowValidity(row, columns)  // Calculate if the row is valid
        }));

        setRowData(processedData);
        
        // Define column definitions
        const defs = columns.map((column: any) => {
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
            cellDataType: cellDataType,
            cellDataTypeAPI: column.type,
            cellClassRules: {
              'invalid-cell': (params: CellValueChangedEvent) => checkInvalidCell(params.value, column.type)
            }
          };
        });
  
        // Append the custom "Validity" column
        defs.push({
          headerName: "Validity",
          field: "isValid",
          cellRenderer: (params: ICellRendererParams) => {
            return <span>{params.data.isValid ? 'Valid' : 'Invalid'}</span>;
          },
          editable: false,
          filter: true,
          sortable: true
        });
  
        // Append the custom "Remove" column
        defs.push({
          headerName: "Remove",
          field: "remove",
          cellRenderer: RemoveButtonRenderer, 
          editable: false,
          filter: false,
          sortable: false,
        });
  
        // Set the updated row data and column definitions
        setRowData(processedData);
        setColumnDefs(defs);
        console.log("Set ColumnDefs:", defs);
      })
      .catch(error => console.error('Error:', error));
  }, [tableName]);  

  // Adds a new row to the grid with the current filters applied
  const handleAddRow = () => {
    const filterModel = gridApiRef.current?.getFilterModel();
    
    const newRow = columnDefs.reduce((acc, colDef) => {
      if (colDef.field && colDef.field !== 'id' && colDef.field !== 'isValid' && colDef.field !== 'remove') {
        if (filterModel && filterModel[colDef.field]) {
          // Apply current filter as the default value for the new row
          acc[colDef.field] = filterModel[colDef.field].filter;
        } else {
          // Assign default values based on the data type
          switch (colDef.cellDataType) {
            case 'boolean':
              acc[colDef.field] = false;
              break;
            case 'text':
              acc[colDef.field] = null;
              break;
            default:
              acc[colDef.field] = null; // Default null for other data types unless specified
              break;
          }
        }
      } else if (colDef.field === 'id') {
        // Assign a temporary negative ID for new rows
        acc[colDef.field] = tempId.current--;
      }
      return acc;
    }, { isValid: true } as Record<string, any>); // Set isValid to true by default
    
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
    // Clear the file input
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }

    // Refetch the data here to ensure the grid reflects the backend state
    setChanges({});
    const refreshedResponse = await fetchData(tableName);
    const { data } = refreshedResponse;
    const updatedRowData = data.map((row: any) => ({
      ...row,
      isValid: checkRowValidity(row, columnDefs)
    }));
    setRowData(updatedRowData); 
  };  

  // Parses the uploaded XLSX file and updates the rowData if the format is valid
  const handleFileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files ? event.target.files[0] : null;
    if (!file) return;

    const { data, isValid } = await parseXLSX(file, columnDefs);
    if (isValid) {
      console.log("Data from file:", data);

      // Apply validity checks to each row based on the current column definitions
      const validatedData = data.map(row => ({
        ...row,
        isValid: checkRowValidity(row, columnDefs)
      }));

      setRowData(validatedData); // Update the state with validated data
      setIsFileUploaded(true);
      setRemovedRowIds([]);
      setChanges({});
      console.log("Validated RowData:", validatedData);
    } else {
      alert('Invalid XLSX format for this table.');
      event.target.value = '';
    }
  };
  
  // Updates the changes object whenever a cell value is changed  
  const onCellValueChanged = ({ data, colDef, rowIndex, columnApi, api }: CellValueChangedEvent) => {
    const focusedCell = api.getFocusedCell(); // Get the currently focused cell

    const updatedIsValid = checkRowValidity(data, columnDefs);
    const updatedRowData = rowData.map(row => {
        if (row.id === data.id) {
            return { ...data, isValid: updatedIsValid };
        }
        return row;
    });

    setRowData(updatedRowData);
    setChanges(prev => ({ ...prev, [data.id]: data }));

    // Optionally, use a timeout to delay focusing until after the state update
    setTimeout(() => {
        if (focusedCell) {
            api.setFocusedCell(focusedCell.rowIndex, focusedCell.column); // Restore focus
        }
    }, 0);
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