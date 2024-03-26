import { useState, useEffect } from 'react';
import { TextCell, HeaderCell } from '@silevis/reactgrid';
import { DataItem, CustomColumn, CustomRow } from '../interfaces/gridInterfaces';

export const usePrepareRows = (data: DataItem[], columns: CustomColumn[]): CustomRow[] => {
  const [rows, setRows] = useState<CustomRow[]>([]);

  useEffect(() => {
    const headerRow: CustomRow = {
      rowId: 'header',
      cells: columns.map((column): HeaderCell => ({ type: 'header', text: column.columnId.toString() })),
    };

    const dataRows: CustomRow[] = data.map((item, idx): CustomRow => ({
      rowId: `item-${idx}`,
      cells: columns.map((column): TextCell => ({
        type: 'text',
        text: item[column.columnId] !== undefined && item[column.columnId] !== null ? item[column.columnId].toString() : '',
      })),
    }));

    setRows([headerRow, ...dataRows]);
  }, [data, columns]);

  return rows;
};
