import React from 'react';
import { ReactGrid } from '@silevis/reactgrid';
import '@silevis/reactgrid/styles.css';
import { updateData } from '../../api/api';
import { handleCellsChanged, handleColumnResize, handleContextMenu } from '../config/gridConfig';
import { useFetchData } from '../../hooks/useFetchData';
import { usePrepareRows } from '../../hooks/usePrepareRows';
import { GenericGridProps } from '../../interfaces/gridInterfaces';

export const GenericGrid: React.FC<GenericGridProps> = ({ tableName }) => {
  const { data, columns, setData, setColumns, isLoading, error } = useFetchData(tableName);
  const [removedRowIds, setRemovedRowIds] = React.useState<string[]>([]); 
  const rows = usePrepareRows(data, columns);

  const cellsChangedHandler = handleCellsChanged(setData);
  const columnResizeHandler = handleColumnResize(setColumns);
  const contextMenuHandler = handleContextMenu(setData, setRemovedRowIds); 

  const handleSubmit = async () => {
    try {
      await updateData(tableName, data, removedRowIds); 
      alert('Updated successfully!');
    } catch (updateError) {
      console.error('Failed to update:', updateError);
      alert('Failed to update.');
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <>
      <h1>{tableName}</h1>
      <ReactGrid
        rows={rows}
        columns={columns}
        onCellsChanged={cellsChangedHandler}
        onColumnResized={columnResizeHandler}
        stickyTopRows={1}
        onContextMenu={contextMenuHandler}
        enableRowSelection
      />
      <button onClick={handleSubmit}>Update</button>
    </>
  );
};
