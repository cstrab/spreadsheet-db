import { api, bulkUpdateData } from './api';
import { BulkUpdateDataPayload} from '../interfaces/apiInterfaces';
import MockAdapter from 'axios-mock-adapter';

describe('bulkUpdateData', () => {
    const mock = new MockAdapter(api);
    const setLoading = jest.fn();
  
    beforeEach(() => {
      jest.resetAllMocks();
      mock.reset();
    });
  
    it('should bulk update data successfully', async () => {
      const tableName: string = 'test_table';
      const controller = new AbortController();
      const payload: BulkUpdateDataPayload = {
        tableName: tableName,
        data: [{ id: -1, name: 'test' }],
      };
  
      mock.onPut('/bulk-update').reply(200);
  
      await bulkUpdateData(payload, setLoading, controller);
  
      expect(setLoading).toHaveBeenCalledWith(true);
      expect(setLoading).toHaveBeenCalledTimes(1);
    });
  
    it('should handle bulk update cancellation', async () => {
      const tableName: string = 'test_table';
      const controller = new AbortController();
      const payload: BulkUpdateDataPayload = {
        tableName: tableName,
        data: [{ id: -1, name: 'test' }],
      };
  
      mock.onPut('/bulk-update').reply(200);
  
      const promise = bulkUpdateData(payload, setLoading, controller);
      controller.abort(); 
  
      await expect(promise).rejects.toThrow('canceled');
      expect(setLoading).toHaveBeenCalledWith(true);
      expect(setLoading).not.toHaveBeenCalledWith(false); 
    });
  
    it('should handle bulk update error', async () => {
      const tableName: string = 'test_table';
      const controller = new AbortController();
      const payload: BulkUpdateDataPayload = {
        tableName: tableName,
        data: [{ id: -1, name: 'test' }],
      };
    
      mock.onPut('/bulk-update').reply(500, 'Internal Server Error');
    
      const promise = bulkUpdateData(payload, setLoading, controller);
    
      await expect(promise).rejects.toThrow('Request failed with status code 500');
      expect(setLoading).toHaveBeenCalledWith(true);
      expect(setLoading).not.toHaveBeenCalledWith(false); 
    });
  });
  