import { api, updateData } from './api';
import { UpdateDataPayload, UpdateResponse } from '../interfaces/apiInterfaces';
import MockAdapter from 'axios-mock-adapter';

describe('updateData', () => {
  const mock = new MockAdapter(api);
  const setLoading = jest.fn();

  beforeEach(() => {
    jest.resetAllMocks();
    mock.reset();
  });

  it('should update data successfully', async () => {
    const tableName: string = 'test_table';
    const controller = new AbortController();
    const mockData: UpdateResponse = {
      updated_ids: [{ tempId: -1, dbId: 1 }]
    };
    const payload: UpdateDataPayload = {
      tableName: tableName,
      data: [{ id: -1, name: 'test' }],
      removedRowIds: []
    };

    mock.onPatch('/update').reply(200, mockData);

    const response: UpdateResponse = await updateData(payload, setLoading, controller);

    expect(setLoading).toHaveBeenCalledWith(true);
    expect(setLoading).toHaveBeenCalledTimes(1);
    expect(response.updated_ids).toEqual([{ tempId: -1, dbId: 1 }]);
  });

  it('should handle update cancellation', async () => {
    const tableName: string = 'test_table';
    const controller = new AbortController();
    const mockData: UpdateResponse = {
      updated_ids: [{ tempId: -1, dbId: 1 }]
    };
    const payload: UpdateDataPayload = {
      tableName: tableName,
      data: [{ id: -1, name: 'test' }],
      removedRowIds: []
    };

    mock.onPatch('/update').reply(200, mockData);

    const promise = updateData(payload, setLoading, controller);
    controller.abort(); 

    await expect(promise).rejects.toThrow('canceled');
    expect(setLoading).toHaveBeenCalledWith(true);
    expect(setLoading).not.toHaveBeenCalledWith(false); 
  });

  it('should handle update error', async () => {
    const tableName: string = 'test_table';
    const controller = new AbortController();
    const payload: UpdateDataPayload = {
      tableName: tableName,
      data: [{ id: -1, name: 'test' }],
      removedRowIds: []
    };
  
    mock.onPatch('/update').reply(500, 'Internal Server Error');
  
    const promise = updateData(payload, setLoading, controller);
  
    await expect(promise).rejects.toThrow('Request failed with status code 500');
    expect(setLoading).toHaveBeenCalledWith(true);
    expect(setLoading).not.toHaveBeenCalledWith(false); 
  });
});