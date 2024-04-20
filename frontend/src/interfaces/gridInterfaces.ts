import { ColDef, ICellRendererParams } from 'ag-grid-community';

export interface ExtendedColDef extends ColDef {
    cellDataType?: 'number' | 'text' | 'boolean' | 'dateString';
    cellDataTypeAPI?: string;
    cellRenderer?: (params: ICellRendererParams) => JSX.Element;
  }

export interface RowData {
    [key: string]: any; 
    isValid: boolean;
    id: number;
  } 