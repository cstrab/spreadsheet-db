import axios from 'axios';

const API_HOST = process.env.REACT_APP_API_HOST || 'localhost';
const API_PORT = process.env.REACT_APP_API_PORT || '8000';

export const fetchData = async (tableName: string) => {
  const response = await axios.post(`http://${API_HOST}:${API_PORT}/read`, { table_name: tableName });
  return response.data;
};

export const updateData = async (tableName: string, data: any[]) => {
  const payload = {
    table_name: tableName,
    updates: { data }
  };
  await axios.post(`http://${API_HOST}:${API_PORT}/update`, payload);
};
