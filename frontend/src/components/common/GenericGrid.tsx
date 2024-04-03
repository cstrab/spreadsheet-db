import React, { useState, useEffect, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ColDef, ICellRendererParams, GridApi } from 'ag-grid-community';
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import { fetchData, updateData } from '../../api/api';
// import Papa from 'papaparse';

const RemoveButtonRenderer = (props: ICellRendererParams) => {
  return <button onClick={() => props.context.handleRemoveRow(props)}>Remove</button>;
};

const GenericGrid = ({ tableName }: { tableName: string }) => {
  const [rowData, setRowData] = useState<any[]>([]);
  const [columnDefs, setColumnDefs] = useState<ColDef[]>([]);
  const [changes, setChanges] = useState({});
  const [removedRowIds, setRemovedRowIds] = useState<string[]>([]);
  // const [file, setFile] = useState<File | null>(null);

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
      })
      .catch(error => console.error('Error:', error));
  }, [tableName]);  
  
  const onCellValueChanged = ({ data }: { data: any }) => {
    setChanges((prev: typeof changes) => ({ ...prev, [data.id]: data }));
  };

  // TODO: WIP
  // const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   setFile(e.target.files ? e.target.files[0] : null);
  // };

  // TODO: WIP
  // const handleUpload = () => {
  //   if (file) {
  //     Papa.parse(file, {
  //       header: true,
  //       dynamicTyping: true,
  //       skipEmptyLines: true,
  //       complete: function(results: { data: Record<string, any>[] }) {
  //         const { data } = results;
    
  //         // Prepare payload
  //         const updates = data.map((row: Record<string, any>, index) => {
  //           const entry: Record<string, any> = { id: -index - 1 };  // Assign negative IDs
  //           for (const field in row) {
  //             if (field !== 'remove') {
  //               const values = row[field].split(',');
  //               const fields = columnDefs.map(colDef => colDef.field).filter(field => field !== 'remove' && field !== 'id') as string[];  // Get the actual dynamic fields
  //               const fieldIndices: Record<string, number> = fields.reduce((acc, field, i) => ({ ...acc, [field]: i }), {});  // Create a mapping from field names to indices
  //               fields.forEach((field: string) => {
  //                 if (fieldIndices[field] !== undefined) {
  //                   entry[field] = values[fieldIndices[field]];
  //                 }
  //               });
  //             }
  //           }
  //           return entry;
  //         });
    
  //         // Add new rows to rowData and changes
  //         setRowData(prev => [...prev, ...updates]);
  //         setChanges(prev => ({ ...prev, ...Object.fromEntries(updates.map(row => [row.id, row])) }));
  //       }
  //     });
  //   }
  // };
  
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

  const tempId = useRef(-1);  // Use useRef instead of let

  const gridApiRef = useRef<GridApi | null>(null);

  const onGridReady = (params: any) => {
    gridApiRef.current = params.api;
  };

  const handleAddRow = () => {
    // Get the current filter model
    const filterModel = gridApiRef.current?.getFilterModel();
  
    const newRow = columnDefs.reduce((acc, colDef) => {
      if (colDef.field && colDef.field !== 'id') {
        // If a filter is applied to this column, use the filter value
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
  
  const handleRemoveRow = (params: ICellRendererParams) => {
    const idToRemove = params.data.id;
    // Filter out the row immediately for visual feedback
    setRowData(prev => prev.filter(row => row.id !== idToRemove));
  
    // Only add the id to removedRowIds if it is defined and not negative
    if (idToRemove !== undefined && idToRemove >= 0) {
      setRemovedRowIds(prev => [...prev, idToRemove]);
    }
  
    // Remove the row from changes if it's there
    setChanges(prev => {
      const newChanges: Record<string | number, any> = { ...prev };
      delete newChanges[idToRemove];
      return newChanges;
    });
  };


  return (
    <div className="ag-theme-quartz" style={{ height: 500 }}>
      <AgGridReact
        rowData={rowData}
        columnDefs={columnDefs}
        onCellValueChanged={onCellValueChanged}
        context={{ handleRemoveRow }}
        onGridReady={onGridReady}  // Add this line
      />
      {/* <input type="file" onChange={handleFileChange} /> */}
      {/* <button onClick={handleUpload}>Upload CSV</button> */}
      <button onClick={handleUpdate}>Update</button>
      <button onClick={handleAddRow}>Add Row</button>
    </div>
  );
};

export default GenericGrid;