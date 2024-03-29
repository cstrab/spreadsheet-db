import React, { useState, useEffect, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ColDef, ICellRendererParams } from 'ag-grid-community';
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import { fetchData, updateData } from '../../api/api';

const RemoveButtonRenderer = (props: ICellRendererParams) => {
  return <button onClick={() => props.context.handleRemoveRow(props)}>Remove</button>;
};

const GenericGrid = ({ tableName }: { tableName: string }) => {
  const [rowData, setRowData] = useState<any[]>([]);
  const [columnDefs, setColumnDefs] = useState<ColDef[]>([]);
  const [changes, setChanges] = useState({});
  const [removedRowIds, setRemovedRowIds] = useState<string[]>([]);


  useEffect(() => {
    fetchData(tableName)
      .then(data => {
        setRowData(data);

        if (data.length > 0) {
          const defs: ColDef[] = Object.keys(data[0]).map(key => ({
            headerName: key.charAt(0).toUpperCase() + key.slice(1),
            field: key,
            editable: true,
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
        }
      })
      .catch(error => console.error('Error:', error));
  }, [tableName]);

  const onCellValueChanged = ({ data }: { data: any }) => {
    setChanges((prev: typeof changes) => ({ ...prev, [data.id]: data }));
  };

  const handleUpdate = async () => {
    const updatedData = Object.values(changes);
    try {
      await updateData(tableName, updatedData, removedRowIds);
      alert('Updated successfully!');
      setRemovedRowIds([]);
      const refreshedData = await fetchData(tableName);
      setRowData(refreshedData);
      setChanges({});
    } catch (error) {
      console.error('Failed to update:', error);
      alert('Failed to update. Please try again.');
    }
  };

  const tempId = useRef(-1);  // Use useRef instead of let

  const handleAddRow = () => {
    const newRow = columnDefs.reduce((acc, colDef) => {
      if (colDef.field && colDef.field !== 'id') {
        acc[colDef.field] = ''; // Use colDef.field as a key
      } else if (colDef.field === 'id') {
        acc[colDef.field] = tempId.current--; // Use tempId.current
      }
      return acc;
    }, {} as Record<string, any>); // Explicitly declare the accumulator as an object with string keys and any type values

    setRowData(prev => [...prev, newRow]);
  };
  
  const handleRemoveRow = (params: ICellRendererParams) => {
    const idToRemove = params.data.id;
    // Filter out the row immediately for visual feedback
    setRowData(rowData.filter(row => row.id !== idToRemove));

    // Only add the id to removedRowIds if it is defined
    if (idToRemove !== undefined) {
        setRemovedRowIds(prev => [...prev, idToRemove]);  // Change this line
    }
};


  return (
    <div className="ag-theme-quartz" style={{ height: 500 }}>
      <AgGridReact
        rowData={rowData}
        columnDefs={columnDefs}
        onCellValueChanged={onCellValueChanged}
        context={{ handleRemoveRow }}
      />
      <button onClick={handleUpdate}>Update</button>
      <button onClick={handleAddRow}>Add Row</button>
    </div>
  );
};

export default GenericGrid;
