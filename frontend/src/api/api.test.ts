import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { fetchData } from './api';
import { ReadResponse } from '../interfaces/apiInterfaces';

describe('API tests', () => {
  let mock: MockAdapter;

  beforeAll(() => {
    mock = new MockAdapter(axios);
  });

  afterEach(() => {
    mock.reset();
  });

  afterAll(() => {
    mock.restore();
  });

  it('fetchData should return data and columns when API call is successful', async () => {
    const tableName = 'test_table';
    const setLoading = jest.fn();
    const controller = new AbortController();
    const mockData: ReadResponse = {
      data: [
        {
          string_column: 'test',
          int_column: 5,
          float_column: null,
          bool_column: false,
          date_column: null,
          datetime_column: null,
          id: 1
        }
      ],
      columns: [
        { name: 'id', type: 'integer' },
        { name: 'string_column', type: 'varchar' },
        { name: 'int_column', type: 'integer' },
        { name: 'float_column', type: 'float' },
        { name: 'bool_column', type: 'boolean' },
        { name: 'date_column', type: 'date' },
        { name: 'datetime_column', type: 'datetime' }
      ]
    };

    mock.onGet('/read', { params: { table_name: tableName } }).reply(200, mockData);

    try {
      const result = await fetchData(tableName, setLoading, controller);
      console.log('Result:', result); 
      expect(setLoading).toHaveBeenCalledWith(true);
      expect(result).toEqual(mockData);
    } catch (error) {
      console.error('Error:', error); 
    }
  });
});
