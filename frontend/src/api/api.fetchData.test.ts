import { api, fetchData } from './api';
import MockAdapter from 'axios-mock-adapter';
import { ReadResponse } from '../interfaces/apiInterfaces';

describe('fetchData', () => {
  const mock = new MockAdapter(api);
  const setLoading = jest.fn();

  beforeEach(() => {
    jest.resetAllMocks();
    mock.reset();
  });

  it('should fetch data successfully', async () => {
    const tableName = 'test_table';
    const controller = new AbortController();
    const mockData = {
        columns: [
          { name: "id", type: "integer" },
          { name: "name", type: "varchar" }
        ],
        data: [
          { id: 1, name: 'test' }
        ]
    };

    mock.onGet('/read', { params: { table_name: tableName } }).reply(200, mockData);

    let response: ReadResponse;

    response = await fetchData(tableName, setLoading, controller);

    expect(setLoading).toHaveBeenCalledWith(true);
    expect(setLoading).toHaveBeenCalledTimes(1); 
    expect(response.data).toEqual([
      { id: 1, name: 'test' }
    ]); 
    expect(response.columns).toEqual([
      { name: "id", type: "integer" },
      { name: "name", type: "varchar" }
    ]); 
  });

  it('should handle fetch cancellation', async () => {
    const tableName = 'test_table';
    const controller = new AbortController();
    const mockData = {
        columns: [{ name: "id", type: "integer" }, { name: "name", type: "varchar" }],
        data: [{ id: 1, name: 'test' }]
    };

    mock.onGet('/read', { params: { table_name: tableName } }).reply(200, mockData);

    const promise = fetchData(tableName, setLoading, controller);
    controller.abort(); 

    await expect(promise).rejects.toThrow('canceled');
    expect(setLoading).toHaveBeenCalledWith(true);
    expect(setLoading).not.toHaveBeenCalledWith(false); 
  });

  it('should handle fetch error', async () => {
    const tableName = 'test_table';
    const controller = new AbortController();
  
    mock.onGet('/read', { params: { table_name: tableName } }).reply(500, 'Internal Server Error');
  
    const promise = fetchData(tableName, setLoading, controller);
  
    await expect(promise).rejects.toThrow('Request failed with status code 500');
    expect(setLoading).toHaveBeenCalledWith(true);
    expect(setLoading).not.toHaveBeenCalledWith(false); 
  });
});
