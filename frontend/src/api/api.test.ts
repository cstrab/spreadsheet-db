import { api, fetchData } from './api';
import MockAdapter from 'axios-mock-adapter';
import { ReadResponse } from '../interfaces/apiInterfaces';

describe('fetchData', () => {
  const mock = new MockAdapter(api);
  const setLoading = jest.fn();
  const controller = new AbortController();

  beforeEach(() => {
    jest.resetAllMocks();
    mock.reset();
  });

  it('should fetch data successfully', async () => {
    const tableName = 'test_table';
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
});
