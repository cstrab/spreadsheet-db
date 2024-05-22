import { renderHook, act } from '@testing-library/react-hooks';
import useGrid from '../hooks/useGrid';
import { parseXLSX } from '../utils/xlsxParser'; 

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
