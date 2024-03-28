import React, { useState, useEffect } from 'react';
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
            cellRenderer: RemoveButtonRenderer, // Use 'cellRenderer' directly for React components
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
      // Reset the removedRowIds state after successful update
      setRemovedRowIds([]);
      // Fetch the updated data to refresh the grid
      const refreshedData = await fetchData(tableName);
      setRowData(refreshedData);
      // Optionally reset changes if you want to clear the changes tracking after successful update
      setChanges({});
    } catch (error) {
      console.error('Failed to update:', error);
      alert('Failed to update. Please try again.');
    }
  };

  const handleAddRow = () => {
    const newRow = columnDefs.reduce((acc, colDef) => {
      if (colDef.field !== 'id') {
        acc[colDef.field as string] = '';
      }
      return acc;
    }, {} as any);

    setRowData(prev => [newRow, ...prev]);
  };

  const handleRemoveRow = (params: ICellRendererParams) => {
    const idToRemove = params.data.id;
    setRowData(rowData.filter(row => row.id !== idToRemove));
    setRemovedRowIds(prev => [...prev, idToRemove.toString()]); // Assuming 'id' is suitable to be converted to string
  };  

  return (
    <div className="ag-theme-quartz" style={{ height: 500 }}>
      <AgGridReact
        rowData={rowData}
        columnDefs={columnDefs}
        onCellValueChanged={onCellValueChanged}
        context={{ handleRemoveRow }}
        // No longer using 'frameworkComponents' as we've directly specified the React component
      />
      <button onClick={handleUpdate}>Update</button>
      <button onClick={handleAddRow}>Add Row</button>
    </div>
  );
};

export default GenericGrid;
