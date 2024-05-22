import { renderHook, act } from '@testing-library/react-hooks';
import useGrid from '../hooks/useGrid';

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
