import { useState, useEffect, useRef, ChangeEvent } from 'react';
import axios from 'axios';
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
  const abortCtrlRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      if (abortCtrlRef.current) {
        console.log('Component unmounting, aborting ongoing update operations');
        abortCtrlRef.current.abort();
        setIsLoading(true);
      }
    };
  }, [tableName]);

  useEffect(() => {
    console.log('useEffect started - setting up AbortController and fetching data');
    const controller = new AbortController();
    console.log('AbortController created:', controller);

    console.log('Fetching data for table:', tableName);
    setIsLoading(true);
    fetchData(tableName, setIsLoading, controller)
      .then(response => { 
        console.log('Fetch successful for table:', tableName, 'Response:', response);
        const { columns, data } = response;
        const processedData: RowData[] = data.map(row => ({
          ...row,
          isValid: checkRowValidity(row, columns)
        }));
        processedData.sort((a, b) => a.id - b.id);
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
          headerName: "",
          field: "remove",
          cellRenderer: RemoveButtonRenderer,
          editable: false,
          filter: false,
          sortable: false,
          resizable: false,
        });
  
        setColumnDefs(defs);
        setIsLoading(false);
      })
      .catch(error => {
        if (axios.isCancel(error)) {
          console.log('Fetch request canceled for table:', tableName, 'Error message:', error.message);
        } else {
          console.error('Error fetching data for table:', tableName, 'Error:', error);
        }
      });
  
      return () => {
        console.log('Cleaning up useEffect - aborting fetch for table:', tableName);
        controller.abort();
        setIsLoading(true);
      };
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
    const invalidRows = rowData.filter(row => row.isValid === false);
    if (invalidRows.length > 0) {
      alert('Cannot update. Some rows have invalid data.');
      return;
    }

    console.log('Starting update operation');
    abortCtrlRef.current = new AbortController();
    console.log('AbortController created for update:', abortCtrlRef.current);

    setIsLoading(true);
    let updateFailed = false;
    try {
      if (isFileUploaded) {
        console.log('Performing bulk update');
        const confirmation = window.confirm("Are you sure you want to perform a bulk update? This will clear and replace the database.");
        console.log('User confirmation:', confirmation);
        if (confirmation) {
          await bulkUpdateData({ tableName, data: rowData }, setIsLoading, abortCtrlRef.current);
          const newRowsData = rowData.map(row => ({
            ...row,
            id: -row.id 
          }));
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
        console.log('Performing regular update');
        const updatePayload = { tableName, data: Object.values(changes), removedRowIds };
        const updateResult = await updateData(updatePayload, setIsLoading, abortCtrlRef.current);
        console.log('Update result received:', updateResult);

        if (updateResult && updateResult.updated_ids) {
          const idMap = new Map(updateResult.updated_ids.map(u => [u.tempId, u.dbId]));
          const newRowsData = rowData.filter(row => 
            row.id > 0 || (row.id < 0 && idMap.has(row.id))
          ).map(row => {
            if (row.id < 0 && idMap.has(row.id)) {
              const newId = idMap.get(row.id);
              if (newId !== undefined) { 
                return { ...row, id: newId };
              }
            }
            return row;
          }).filter(row => row.id !== undefined); 
          setRowData(newRowsData.map(row => ({
            ...row,
            isValid: checkRowValidity(row, columnDefs)
          })));
          alert('Update successful!');
        } else {
          alert("No ID mapping returned from update. No updates were made.");
        }
        setRemovedRowIds([]);
        setChanges({});
      }
    } catch (error) {
      console.log('Error during update operation:', error);
      if (axios.isCancel(error)) {
        console.log('Update request canceled');
        updateFailed = true;
      } else {
        console.log('Error during update:', error);
        alert('Failed to update. Please try again.');
        updateFailed = true;
      }
    } finally {
      console.log('Finalizing update operation');
      setIsLoading(false);
      setIsFileUploaded(false);
      if (updateFailed) {
        console.log('Update failed, refetching data');
        fetchData(tableName, setIsLoading, abortCtrlRef.current)
          .then(response => {
            const updatedData = response.data.map(row => ({
              ...row,
              isValid: checkRowValidity(row, response.columns)
            }));
            setRowData(updatedData);
            setIsLoading(false);
          })
            .catch(error => {
            console.log('Error during refetch:', error);
            if (axios.isCancel(error)) {
              console.log('Refetch request canceled', error.message);
            } else {
              console.error('Error fetching data after update failure:', error);
            }
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
