import { ExtendedColDef } from '../interfaces/gridInterfaces'; 

export const checkInvalidCell = (value: any, type: string): boolean => {
    if (value === null) {
        return false;
    }
    switch (type) {
        case 'integer': return !Number.isInteger(Number(value));
        case 'float': return isNaN(Number(value));
        case 'varchar': return typeof value !== 'string';
        case 'boolean': return typeof value !== 'boolean' && value !== 'true' && value !== 'false';
        case 'date': return !/^\d{4}-\d{2}-\d{2}$/.test(value);
        case 'datetime': return !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(value);
        default: return false;
    }
};

export const checkRowValidity = (row: any, columns: ExtendedColDef[]): boolean => {
    return columns.every(column => {
        if (typeof column.field === 'undefined' || ['id', 'isValid', 'remove'].includes(column.field)) {
            return true; 
        }
        return column.cellDataTypeAPI ? !checkInvalidCell(row[column.field], column.cellDataTypeAPI) : false;
    });
};
