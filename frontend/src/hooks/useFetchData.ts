import { useState, useEffect } from 'react';
import { fetchData } from '../api/api';
import { DataItem, CustomColumn } from '../interfaces/gridInterfaces';

export const useFetchData = (tableName: string) => {
  const [data, setData] = useState<DataItem[]>([]);
  const [columns, setColumns] = useState<CustomColumn[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const responseData: DataItem[] = await fetchData(tableName);
        setData(responseData);
        if (responseData.length > 0) {
          const cols: CustomColumn[] = Object.keys(responseData[0]).map((key): CustomColumn => ({
            columnId: key,
            width: 150,
            resizable: true,
          })).filter(column => column.columnId !== 'id')
          .sort((a, b) => a.columnId === 'id' ? -1 : b.columnId === 'id' ? 1 : 0);
          setColumns(cols);
        }
      } catch (err) {
        console.error('Failed to fetch data:', err);
        setError(err instanceof Error ? err : new Error('An error occurred'));
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [tableName]);

  return { data, columns, setData, setColumns, isLoading, error };
};
