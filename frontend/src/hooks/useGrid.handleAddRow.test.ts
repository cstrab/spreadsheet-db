import { renderHook, act } from '@testing-library/react-hooks';
import useGrid from '../hooks/useGrid';

describe('handleAddRow', () => {
    it('should add a new row to rowData with correct values', () => {
      const { result } = renderHook(() => useGrid('testTable'));

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
