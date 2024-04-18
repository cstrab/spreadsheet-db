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
  if (value === null) {
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
    case 'date':
      // Check if the date string is in 'YYYY-MM-DD' format
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      return !dateRegex.test(value);
    case 'datetime':
      // Check if the datetime string is in 'YYYY-MM-DDTHH:MM:SS' format
      const datetimeRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/;
      return !datetimeRegex.test(value);
    default:
      return false;
  }
};

const checkRowValidity = (row: any, columns: ExtendedColDef[]): boolean => {
  return columns.every(column => {
    if (typeof column.field === 'undefined') {
      // Skip this iteration as we can't check a column without a field name
      return true;
    }

    if (column.field === 'id' || column.field === 'isValid' || column.field === 'remove') {
      // Skip checking control fields
      return true;
    }

    const columnType = column.cellDataTypeAPI;
    if (columnType) {
      // Directly return the validity of the field
      return !checkInvalidCell(row[column.field], columnType);
    } else {
      // If there is no type defined for the field, consider the row invalid
      return false;
    }
  });
};

// Generic grid component that displays data from the backend
const GenericGrid = ({ tableName }: { tableName: string }) => {
  const [rowData, setRowData] = useState<any[]>([]);
  const [columnDefs, setColumnDefs] = useState<ExtendedColDef[]>([]);
  const [changes, setChanges] = useState({});
  const [removedRowIds, setRemovedRowIds] = useState<string[]>([]);
  const [isFileUploaded, setIsFileUploaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const gridApiRef = useRef<GridApi | null>(null);
  const tempId = useRef(-1);  

  // Temporary logs the updated state of rowData whenever it changes
  useEffect(() => {
    console.log("RowData after update:", rowData);
  }, [rowData]); 
  
  // Fetches data from the backend and sets columnDefs whenever tableName changes
  useEffect(() => {
    fetchData(tableName, setIsLoading)
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
            case 'date':
              cellDataType = 'dateString';
              break;
            case 'datetime':
              cellDataType = 'text';
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

    // Generate a unique temporary ID for the new row by decrementing tempId
    const newId = --tempId.current;

    console.log("Assigning new ID:", newId)

    const newRow = columnDefs.reduce<Record<string, any>>((acc, colDef) => {
        const field = colDef.field;
        if (field && field !== 'id' && field !== 'isValid' && field !== 'remove') {
            if (filterModel && filterModel[field]) {
                // Apply current filter as the default value for the new row
                acc[field] = filterModel[field].filter;
            } else {
                // Assign default values based on the data type
                switch (colDef.cellDataType) {
                    case 'boolean':
                        acc[field] = false;
                        break;
                    case 'text':
                        acc[field] = null;
                        break;
                    default:
                        acc[field] = null; // Default null for other data types unless specified
                        break;
                }
            }
        } else if (field === 'id') {
            // Assign a unique temporary negative ID for new rows
            acc[field] = newId;
        }
        return acc;
    }, { isValid: true, id: newId }); // Set isValid to true by default and initialize with the unique ID

    setRowData(prev => [...prev, newRow]);
    console.log("RowData after update Add Row:", rowData);  
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
// Updates the data in the backend with the changes and provides removedRowIds for deletion
const handleUpdate = async () => {
  let updateFailed = false;

  if (isFileUploaded) {
      if (window.confirm("Are you sure you want to perform bulk update? This will clear and replace the database")) {
          try {
              await bulkUpdateData(tableName, rowData, setIsLoading);
              alert('Bulk update successful!');
              setIsFileUploaded(false); // Ensure this is reset after successful update
          } catch (error) {
              console.error('Failed bulk update:', error);
              alert('Failed to bulk update. Please try again.');
              updateFailed = true;
          }
      }
  } else {
      const updatedData = Object.values(changes);
      try {
          await updateData(tableName, updatedData, removedRowIds, setIsLoading);
          alert('Update successful!');
          setRemovedRowIds([]);
      } catch (error) {
          console.error('Failed to update:', error);
          alert('Failed to update. Please try again.');
          updateFailed = true;
      }
  }

  setChanges({});  // Reset changes regardless of the update success

  // Clear the file input
  const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
  if (fileInput) {
      fileInput.value = '';
  }

  // Only refetch the data if the update failed
  if (updateFailed) {
      setIsFileUploaded(false); // Ensure to reset file upload state on failure too
      try {
          const refreshedResponse = await fetchData(tableName, setIsLoading);
          const { data } = refreshedResponse;
          const updatedRowData = data.map((row: any) => ({
              ...row,
              isValid: checkRowValidity(row, columnDefs)
          }));
          setRowData(updatedRowData);
      } catch (error) {
          console.error('Failed to fetch data:', error);
      }
  } else {
      setIsFileUploaded(false); // Ensure this is reset on success too if not already handled
  }
};

  // Parses the uploaded XLSX file and updates the rowData if the format is valid
  const handleFileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files ? event.target.files[0] : null;
    if (!file) return;

    setIsLoading(true); // Set loading to true when file parsing starts

    try {
      // Temp logging
      const startTimeParse = performance.now(); 

      const { data, isValid } = await parseXLSX(file, columnDefs);

      // Temp logging
      const endTimeParse = performance.now(); 
      console.log(`Time taken to parse the data: ${endTimeParse - startTimeParse} milliseconds`); 

      if (isValid) {
        // Temp logging
        const startTimeValidation = performance.now(); 

        // Apply validity checks to each row based on the current column definitions
        const validatedData = data.map(row => ({
          ...row,
          isValid: checkRowValidity(row, columnDefs)
        }));

        // Temp logging
        const endTimeValidation = performance.now();
        console.log(`Time taken to validate the data: ${endTimeValidation - startTimeValidation} milliseconds`);

        setRowData(validatedData); // Update the state with validated data
        setIsFileUploaded(true);
        setRemovedRowIds([]);
        setChanges({});
      } else {
        alert('Invalid XLSX format for this table.');
        event.target.value = ''; // Clear the input value
      }
    } catch (error) {
      console.error('Error during file upload:', error);
      alert('Failed to process the file. Please try again.');
    } finally {
      setIsLoading(false); // Reset loading state whether the file processing succeeds or fails
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

  const renderLoadingOverlay = () => {
    if (isLoading) {
      return (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="ag-theme-quartz" style={{ height: 800 }}>
      {renderLoadingOverlay()}
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