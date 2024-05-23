import { renderHook, act } from '@testing-library/react-hooks';
import useGrid from '../hooks/useGrid';
import { parseXLSX } from '../utils/xlsxParser'; 

import MockAdapter from 'axios-mock-adapter';
import { api } from '../api/api';

describe('handleAddRow', () => {
    it('should add a new row to rowData with correct values', () => {
      const { result } = renderHook(() => useGrid('test_table'));

      act(() => {
        result.current.handleAddRow();
      });

      const newRow = result.current.rowData[0];

      expect(result.current.rowData).toHaveLength(1);
      expect(newRow).toHaveProperty('id');
      expect(newRow).toHaveProperty('isValid', true);

      for (const field of Object.keys(newRow)) {
        if (field !== 'id' && field !== 'isValid') {
          expect(newRow[field]).toBeNull();  
        }
      }

      expect(newRow.id).toBeLessThan(0); 
    });
});

jest.mock('../utils/xlsxParser', () => ({
  parseXLSX: jest.fn()
}));

describe('handleFileUpload', () => {
    it('should process valid file and update state', async () => {
      const { result, waitForNextUpdate } = renderHook(() => useGrid('test_table'));
      const mockFile = new File(['test'], 'test.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

      parseXLSX.mockResolvedValue({ data: [{ id: 1, someField: 'data' }], isValid: true });

      const mockEvent = {
        target: {
          files: [mockFile],
          value: '',
        }
      };

      act(() => {
        result.current.handleFileUpload(mockEvent);
      });

      await waitForNextUpdate();

      expect(result.current.rowData).toEqual([{ id: 1, someField: 'data', isValid: true }]);
      expect(result.current.isFileUploaded).toBeTruthy();
      expect(result.current.isLoading).toBeFalsy();
    });

    it('should alert and not update state if file is invalid', async () => {
      const { result, waitForNextUpdate } = renderHook(() => useGrid('test_table'));
      const mockFile = new File(['test'], 'test.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

      parseXLSX.mockResolvedValue({ data: [], isValid: false });

      const mockEvent = {
        target: {
          files: [mockFile],
          value: '',
        }
      };

      const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});

      act(() => {
        result.current.handleFileUpload(mockEvent);
      });

      await waitForNextUpdate();

      expect(alertSpy).toHaveBeenCalledWith('Invalid XLSX format for this table.');
      expect(result.current.rowData).toEqual([]);  
      expect(result.current.isLoading).toBeFalsy();

      alertSpy.mockRestore();
    });

    it('should handle exceptions during file processing', async () => {
      const { result, waitForNextUpdate } = renderHook(() => useGrid('test_table'));
      const mockFile = new File(['test'], 'test.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

      parseXLSX.mockRejectedValue(new Error('Failed to process file'));

      const mockEvent = {
        target: {
          files: [mockFile],
          value: '',
        }
      };

      const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});

      act(() => {
        result.current.handleFileUpload(mockEvent);
      });

      await waitForNextUpdate();

      expect(errorSpy).toHaveBeenCalledWith('Error during file upload:', expect.any(Error));
      expect(alertSpy).toHaveBeenCalledWith('Failed to process the file. Please try again.');
      expect(result.current.isLoading).toBeFalsy();

      errorSpy.mockRestore();
      alertSpy.mockRestore();
    });
});

describe('handleRemoveRow', () => {
    it('should remove a specified row from rowData and record its ID', () => {
      const { result } = renderHook(() => useGrid('test_table'));

      act(() => {
        result.current.handleAddRow();
        result.current.handleAddRow();
      });

      const initialRow = result.current.rowData.find(row => row.id < 0);

      const mockCellRendererParams = {
        data: initialRow,
        node: {},
        rowIndex: 0,
        value: initialRow ? initialRow.someField : null,
        valueFormatted: null,
        api: null,
        columnApi: null,
        context: null,
        colDef: null
      };

      act(() => {
        result.current.handleRemoveRow(mockCellRendererParams);
      });

      expect(result.current.rowData).toHaveLength(1);
      expect(result.current.rowData.some(row => row.id === initialRow?.id)).toBe(false);
    });
});

describe('onCellValueChanged', () => {
    it('should trigger state updates on cell value change', async () => {
      jest.useFakeTimers(); 
      const { result } = renderHook(() => useGrid('test_table'));

      const setFocusedCell = jest.fn();
      result.current.gridApiRef.current = {
        getFocusedCell: jest.fn(() => ({ rowIndex: 0, column: 'test_field' })),
        setFocusedCell: setFocusedCell
      };

      const cellChangeEvent = {
        data: { id: 1, someField: 'new_value', isValid: true },
        oldValue: 'old_value',
        newValue: 'new_value',
        column: { colId: 'test_field' },
        api: result.current.gridApiRef.current,
        context: {},
        source: 'UI'
      };

      act(() => {
        result.current.onCellValueChanged(cellChangeEvent);
        jest.runAllTimers(); 
      });

      expect(setFocusedCell).toHaveBeenCalledWith(0, 'test_field');

      jest.useRealTimers(); 
    });
});

describe('useEffect', () => {
    it('should abort ongoing operations on unmount', () => {
      const abortSpy = jest.spyOn(AbortController.prototype, 'abort');
      const { unmount } = renderHook(() => useGrid('test_table'));

      unmount();

      expect(abortSpy).toHaveBeenCalled();
      abortSpy.mockRestore();
    });

    it('should fetch data on mount and update state correctly', async () => {
      const mock = new MockAdapter(api);
      const tableName = 'test_table';
      const mockResponse = {
        columns: [{ name: 'id', type: 'integer' }, { name: 'name', type: 'varchar' }],
        data: [{ id: 1, name: 'test' }]
      };

      mock.onGet('/read', { params: { table_name: tableName } }).reply(200, mockResponse);

      const { result, waitForNextUpdate } = renderHook(() => useGrid('test_table'));

      expect(result.current.isLoading).toBeTruthy();

      await waitForNextUpdate();

      expect(result.current.isLoading).toBeFalsy();
      expect(result.current.rowData).toEqual([{ id: 1, name: 'test', isValid: true }]);
      expect(result.current.columnDefs).toHaveLength(4); 

      mock.restore();
    });

    it('should handle errors during data fetching', async () => {
      const mock = new MockAdapter(api);
      const tableName = 'test_table';
      mock.onGet('/read', { params: { table_name: tableName } }).networkError();

      const { result, waitForNextUpdate } = renderHook(() => useGrid(tableName));
      expect(result.current.isLoading).toBeTruthy(); 

      await act(async () => {
        try {
          await waitForNextUpdate(); 
        } catch (error) {
        }
      });

      expect(result.current.rowData).toHaveLength(0);

      mock.restore();
    });
});

describe('handleUpddate', () => {
    it('should handles updates correctly', async () => {
      const mock = new MockAdapter(api);
      const tableName = 'test_table';

      const { result, waitForNextUpdate } = renderHook(() => useGrid(tableName));

      act(() => {
        result.current.handleAddRow(); 
      });

      mock.onPatch('/update').reply(200, {
        updated_ids: [{ tempId: result.current.rowData[0].id, dbId: 2 }]
      });

      await act(async () => {
        await result.current.handleUpdate();
      });

      try {
        await waitForNextUpdate(); 
      } catch (e) {
        console.error('Error or timeout while waiting for update:', e);
      }

      expect(result.current.rowData.some(r => r.id === 2)).toBeTruthy();
      mock.restore();
    });

    it('should handle bulk updates correctly', async () => {
      const mock = new MockAdapter(api);
      const tableName = 'test_table';

      window.confirm = jest.fn().mockReturnValue(true);

      const { result, waitForNextUpdate } = renderHook(() => useGrid(tableName));

      act(() => {
        const file = new Blob(['test'], { type: 'text/plain' });
        const fileEvent = { target: { files: [file] } };
        result.current.handleFileUpload(fileEvent);
      });

      await waitForNextUpdate();

      mock.onPut('/bulk-update').reply(200, {
        message: "Bulk update successful!"
      });

      await act(async () => {
        await result.current.handleUpdate(); 
      });

      expect(result.current.isFileUploaded).toBeFalsy();
      mock.restore();
    });

    it('should handle network error during regular update', async () => {
      const mock = new MockAdapter(api);
      const tableName = 'test_table';
      const { result, waitForNextUpdate } = renderHook(() => useGrid(tableName));

      act(() => {
        result.current.handleAddRow(); 
      });

      mock.onPatch('/update').networkError();

      const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});

      await act(async () => {
        await result.current.handleUpdate();
      });

      expect(alertSpy).toHaveBeenCalledWith('Failed to update. Please try again.');

      alertSpy.mockRestore();
      mock.restore();
    });
});