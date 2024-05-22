import { renderHook, act } from '@testing-library/react-hooks';
import useGrid from '../hooks/useGrid';

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
