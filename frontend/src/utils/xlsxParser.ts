import * as XLSX from 'xlsx';
import { ColDef } from 'ag-grid-community';

export const parseXLSX = async (file: File, columnDefs: ColDef[]): Promise<{data: Array<Record<string, any>>, isValid: boolean}> => {
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

      // Check if headers match columnDefs fields
      const columnFields = columnDefs
        .filter(colDef => colDef.field !== undefined)
        .map(colDef => colDef.field!.toLowerCase());

      const isValid = headers.every(header => columnFields.includes(header));

      if (isValid) {
        const dataWithTempIds = rows.map((row, index) => {
          const rowObj = headers.reduce<Record<string, any>>((obj, header, i) => {
            let cellValue = row[i] || null;
            // Convert 'true' and 'false' strings to actual boolean values
            if (cellValue === 'true') {
              cellValue = true;
            } else if (cellValue === 'false') {
              cellValue = false;
            }
            obj[header] = cellValue;
            return obj;
          }, {});

          return {
            ...rowObj,
            id: -(index + 1) 
          };
        });

        resolve({ data: dataWithTempIds, isValid: dataWithTempIds.length > 0 });
      } else {
        resolve({ data: [], isValid: false });
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsBinaryString(file);
  });
};
