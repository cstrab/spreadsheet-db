import { useState, useEffect, useRef, ChangeEvent } from 'react';
import { fetchData, updateData, bulkUpdateData } from '../api/api';
import { parseXLSX } from '../utils/xlsxParser';
import { checkRowValidity, checkInvalidCell } from '../utils/validation';
import { ExtendedColDef, RowData } from '../interfaces/gridInterfaces';
import { GridApi, CellValueChangedEvent, ICellRendererParams } from 'ag-grid-community';
import RemoveButtonRenderer from '../components/common/RemoveButtonRenderer';
import ValidityRenderer from '../components/common/ValidityRenderer';

const useGrid = (tableName: string) => {
  const [rowData, setRowData] = useState<RowData[]>([]); 
  const [columnDefs, setColumnDefs] = useState<ExtendedColDef[]>([]);
  const [changes, setChanges] = useState<Record<number | string, RowData>>({}); 
  const [removedRowIds, setRemovedRowIds] = useState<string[]>([]);
  const [isFileUploaded, setIsFileUploaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const gridApiRef = useRef<GridApi | null>(null);
  const tempId = useRef(-1);

  useEffect(() => {
    setIsLoading(true);
    fetchData(tableName, setIsLoading)
      .then(response => { 
        const { columns, data } = response;
        const processedData: RowData[] = data.map(row => ({
          ...row,
          isValid: checkRowValidity(row, columns)
        }));
        setRowData(processedData);

        const defs: ExtendedColDef[] = columns.map((column: any) => ({
          headerName: column.name.charAt(0).toUpperCase() + column.name.slice(1),
          field: column.name,
          editable: true,
          filter: true,
          hide: column.name === 'id',
          cellDataType: ['integer', 'float'].includes(column.type) ? 'number' :
                        ['varchar'].includes(column.type) ? 'text' :
                        ['boolean'].includes(column.type) ? 'boolean' :
                        ['date'].includes(column.type) ? 'dateString' : 'text',
          cellDataTypeAPI: column.type,
          cellClassRules: {
            'invalid-cell': (params: any) => checkInvalidCell(params.data[column.name], column.type)
          }
        }));

        defs.push({
          headerName: "Validity",
          field: "isValid",
          cellRenderer: ValidityRenderer,
          editable: false,
          filter: true,
          sortable: true
        });

        defs.push({
          headerName: "Remove",
          field: "remove",
          cellRenderer: RemoveButtonRenderer,
          editable: false,
          filter: false,
          sortable: false
        });

        setColumnDefs(defs);
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Error:', error);
        setIsLoading(false);
      });
  }, [tableName]);

  const handleAddRow = () => {
    const filterModel = gridApiRef.current?.getFilterModel();
    const newId = --tempId.current;  

    const newRow = columnDefs.reduce((acc: RowData, colDef) => {
        const field = colDef.field;
        if (field && field !== 'id' && field !== 'isValid' && field !== 'remove') {
            if (filterModel && filterModel[field]) {
                acc[field] = filterModel[field].filter;
            } else {
                switch (colDef.cellDataType) {
                    case 'boolean':
                        acc[field] = false; 
                        break;
                    default:
                        acc[field] = null; 
                        break;
                }
            }
        } else if (field === 'id') {
            acc[field] = newId; 
        }
        return acc;
    }, { isValid: true, id: newId }); 

    setRowData(prev => [...prev, newRow]);
  };
  
  const handleRemoveRow = (params: ICellRendererParams) => {
    const idToRemove = params.data.id;  
    setRowData(prev => prev.filter(row => row.id !== idToRemove));
    setRemovedRowIds(prev => [...prev, idToRemove.toString()]);  

    setChanges(prev => {
      const newChanges = { ...prev };
      delete newChanges[idToRemove];  
      return newChanges;
    });
  };

  const handleUpdate = async () => {
    setIsLoading(true);
    let updateFailed = false;
    try {
      if (isFileUploaded) {
        const confirmation = window.confirm("Are you sure you want to perform a bulk update? This will clear and replace the database.");
        if (confirmation) {
          const updateResult = await bulkUpdateData({ tableName, data: rowData }, setIsLoading);
          const idMap = updateResult.updated_ids;
          if (!idMap) {
            throw new Error("No ID mapping returned from bulk update.");
          }
          const newRowsData = rowData.map(row => {
            const update = idMap.find(map => map.tempId === row.id);
            return update ? { ...row, id: update.dbId } : row;
          });
          setRowData(newRowsData.map(row => ({
            ...row,
            isValid: checkRowValidity(row, columnDefs)
          })));
          alert('Bulk update successful!');
          setIsFileUploaded(false);
          setRemovedRowIds([]);
          setChanges({});
        }
      } else {
        const updatePayload = { tableName, data: Object.values(changes), removedRowIds };
        const updateResult = await updateData(updatePayload, setIsLoading);
        const idMap = updateResult.updated_ids;
        if (!idMap) {
            throw new Error("No ID mapping returned from update.");
        }
        const newRowsData = rowData.map(row => {
          if (row.id < 0) {
            const update = idMap.find(map => map.tempId === row.id);
            return update ? { ...row, id: update.dbId } : row;
          }
          return row;
        });
        setRowData(newRowsData.map(row => ({
          ...row,
          isValid: checkRowValidity(row, columnDefs)
        })));
        alert('Update successful!');
        setRemovedRowIds([]);
        setChanges({});
      }
    } catch (error) {
      alert('Failed to update. Please try again.');
      updateFailed = true;
      setRemovedRowIds([]);
      setChanges({});
    } finally {
      setIsLoading(false);
      if (updateFailed) {
        fetchData(tableName, setIsLoading)
          .then(response => {
            const updatedData = response.data.map(row => ({
              ...row,
              isValid: checkRowValidity(row, response.columns)
            }));
            setRowData(updatedData);
          })
          .catch(error => {
          });
      }
    }
  };

  const handleFileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files ? event.target.files[0] : null;
    if (!file) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const { data, isValid } = await parseXLSX(file, columnDefs);
      if (isValid) {
        const validatedData = data.map(row => ({
          ...row,
          id: row.id,  
          isValid: checkRowValidity(row, columnDefs)
        }));
        setRowData(validatedData);
        setIsFileUploaded(true);
        setRemovedRowIds([]);
        setChanges({});
      } else {
        alert('Invalid XLSX format for this table.');
      }
    } catch (error) {
      console.error('Error during file upload:', error);
      alert('Failed to process the file. Please try again.');
    } finally {
      setIsLoading(false);
    }
    event.target.value = '';  
  };  

  const onCellValueChanged = ({ data, api }: CellValueChangedEvent) => {
    const focusedCell = api.getFocusedCell();
    const updatedIsValid = checkRowValidity(data, columnDefs);
    const updatedRowData = rowData.map(row => {
        if (row.id === data.id) {
            return { ...data, isValid: updatedIsValid };
        }
        return row;
    });
    setRowData(updatedRowData);
    setChanges(prev => ({ ...prev, [data.id]: data }));
    setTimeout(() => {
        if (focusedCell) {
            api.setFocusedCell(focusedCell.rowIndex, focusedCell.column);
        }
    }, 0);
  };

  return {
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
  };
};

export default useGrid;
