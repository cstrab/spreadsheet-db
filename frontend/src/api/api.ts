import axios from 'axios';
import { ReadResponse, UpdateResponse, UpdateDataPayload, BulkUpdateDataPayload } from '../interfaces/apiInterfaces';

const api = axios.create({
  baseURL: `http://${process.env.REACT_APP_API_HOST || 'localhost'}:${process.env.REACT_APP_API_PORT || '8000'}`,
});

export const fetchData = async (tableName: string, setLoading: (isLoading: boolean) => void, controller: AbortController): Promise<ReadResponse> => {
  setLoading(true);
  try {
    const response = await api.get('/read', { params: { table_name: tableName }, signal: controller.signal });
    return {
      data: response.data.data,
      columns: response.data.columns
    };
  } catch (error) {
    if (axios.isCancel(error)) {
      console.log('Request canceled', error.message);
    } else {
      console.error('Failed to fetch data:', error);
    }
    throw error;
  } finally {
    setLoading(false);
  }
};

export const updateData = async ({ tableName, data, removedRowIds }: UpdateDataPayload, setLoading: (isLoading: boolean) => void, controller: AbortController): Promise<UpdateResponse> => {
  setLoading(true);
  const payload = {
    table_name: tableName,
    updates: { data },
    removed_row_ids: removedRowIds
  };
  try {
    const response = await api.patch('/update', payload, { signal: controller.signal });
    return response.data;
  } catch (error) {
    if (axios.isCancel(error)) {
      console.log('Request canceled', error.message);
    } else {
      console.error('Failed to update data:', error);
    }
    throw error;
  } finally {
    setLoading(false);
  }
};

export const bulkUpdateData = async ({ tableName, data }: BulkUpdateDataPayload, setLoading: (isLoading: boolean) => void, controller: AbortController): Promise<void> => {
  setLoading(true);
  const payload = {
    table_name: tableName,
    updates: { data }
  };
  try {
    const response = await api.put('/bulk-update', payload, { signal: controller.signal });
    return response.data; 
  } catch (error) {
    if (axios.isCancel(error)) {
      console.log('Request canceled', error.message);
    } else {
      console.error('Failed to perform bulk update:', error);
    }
    throw error;
  } finally {
    setLoading(false);
  }
};
