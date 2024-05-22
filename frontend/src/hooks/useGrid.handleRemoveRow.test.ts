import { renderHook, act } from '@testing-library/react-hooks';
import useGrid from '../hooks/useGrid';

describe('handleRemoveRow', () => {
  it('should remove a row from rowData and update removedRowIds and changes', () => {
    const { result } = renderHook(() => useGrid('testTable'));

    // Mock gridApiRef.current
    result.current.gridApiRef.current = {
      getFilterModel: () => ({}),  // Adjust this as needed based on your filter model
    };

    // Add a row first so we have something to remove
    act(() => {
      result.current.handleAddRow();
    });

    const idToRemove = result.current.rowData[0].id;

    // Make a change to the row so we can test that it's removed from changes
    act(() => {
      result.current.onCellValueChanged({ data: { ...result.current.rowData[0], someField: 'newValue' }, api: result.current.gridApiRef.current });
    });

    expect(result.current.changes).toHaveProperty(idToRemove.toString());

    // Create a mock params object
    const mockParams = {
      data: result.current.rowData[0],
      node: {},  // Add other properties as needed
      value: {},  // Add other properties as needed
      valueFormatted: {},  // Add other properties as needed
      rowIndex: 0,  // Add other properties as needed
      colDef: {},  // Add other properties as needed
      column: {},  // Add other properties as needed
      columnGroup: {},  // Add other properties as needed
      context: {},  // Add other properties as needed
      refreshCell: () => {},  // Add other properties as needed
    };

    // Now remove the row
    act(() => {
      result.current.handleRemoveRow(mockParams);
    });

    expect(result.current.rowData).toHaveLength(0);
    expect(result.current.removedRowIds).toContain(idToRemove.toString());
    expect(result.current.changes).not.toHaveProperty(idToRemove.toString());
  });
});
