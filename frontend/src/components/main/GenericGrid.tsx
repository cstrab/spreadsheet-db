import { AgGridReact } from 'ag-grid-react';
import useGrid from '../../hooks/useGrid';  
import LoadingOverlay from '../common/LoadingOverlay';
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";

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
    gridApiRef
  } = useGrid(tableName);

  const onGridReady = (params: any) => {
    gridApiRef.current = params.api;
  };

  return (
    <div className="ag-theme-quartz" style={{ height: 800 }}>
      <LoadingOverlay isLoading={isLoading} />
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
