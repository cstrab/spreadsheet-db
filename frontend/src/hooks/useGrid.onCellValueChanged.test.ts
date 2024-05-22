import { renderHook, act } from '@testing-library/react-hooks';
import useGrid from '../hooks/useGrid';

describe('onCellValueChanged', () => {
  it('should trigger state updates on cell value change', async () => {
    jest.useFakeTimers(); // Use fake timers
    const { result } = renderHook(() => useGrid('testTable'));

    const setFocusedCell = jest.fn();
    result.current.gridApiRef.current = {
      getFocusedCell: jest.fn(() => ({ rowIndex: 0, column: 'someField' })),
      setFocusedCell: setFocusedCell
    };

    const cellChangeEvent = {
      data: { id: 1, someField: 'newValue', isValid: true },
      oldValue: 'oldValue',
      newValue: 'newValue',
      column: { colId: 'someField' },
      api: result.current.gridApiRef.current,
      context: {},
      source: 'UI'
    };

    act(() => {
      result.current.onCellValueChanged(cellChangeEvent);
      jest.runAllTimers(); 
    });

    expect(setFocusedCell).toHaveBeenCalledWith(0, 'someField');

    jest.useRealTimers(); 
  });
});
