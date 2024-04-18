import axios from 'axios';

const API_HOST = process.env.REACT_APP_API_HOST || 'localhost';
const API_PORT = process.env.REACT_APP_API_PORT || '8000';

export const fetchData = async (tableName: string, setLoading: (isLoading: boolean) => void) => {
  setLoading(true);
  try {
    const response = await axios.post(`http://${API_HOST}:${API_PORT}/read`, { table_name: tableName });
    return {
      data: response.data.data,
      columns: response.data.columns
    };
  } catch (error) {
    throw error;
  } finally {
    setLoading(false);
  }
};

export const updateData = async (tableName: string, data: any[], removedRowIds: string[], setLoading: (isLoading: boolean) => void) => {
  setLoading(true);
  const payload = {
    table_name: tableName,
    updates: { data },
    removed_row_ids: removedRowIds
  };
  try {
    await axios.post(`http://${API_HOST}:${API_PORT}/update`, payload);
  } catch (error) {
    throw error;
  } finally {
    setLoading(false);
  }
};

export const bulkUpdateData = async (tableName: string, data: any[], setLoading: (isLoading: boolean) => void) => {
  setLoading(true);
  const payload = {
    table_name: tableName,
    updates: { data }
  };
  try {
    await axios.post(`http://${API_HOST}:${API_PORT}/bulk-update`, payload);
  } catch (error) {
    throw error;
  } finally {
    setLoading(false);
  }
};
