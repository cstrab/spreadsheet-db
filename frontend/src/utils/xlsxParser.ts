import * as XLSX from 'xlsx';
import { ColDef } from 'ag-grid-community';

export const parseXLSX = async (file: File): Promise<{data: Array<Record<string, any>>, isValid: boolean}> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      const data = e.target?.result;
      const workbook = XLSX.read(data, { type: 'binary' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const rows: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: true });

      // Type assertion to ensure rows.shift() is treated as an array of strings
      const headers = (rows.shift() || []).map(header => header.toString().toLowerCase());
      const dataWithTempIds = rows.map((row, index) => {
        const rowObj = headers.reduce<Record<string, any>>((obj, header, i) => {
          // Type assertion for row[i] to treat it as any type, which allows assignment
          obj[header] = row[i] || ''; 
          return obj;
        }, {});

        return {
          ...rowObj,
          id: -(index + 1) // Assign temporary negative IDs
        };
      });

      resolve({ data: dataWithTempIds, isValid: dataWithTempIds.length > 0 });
    };
    reader.onerror = (error) => reject(error);
    reader.readAsBinaryString(file);
  });
};
