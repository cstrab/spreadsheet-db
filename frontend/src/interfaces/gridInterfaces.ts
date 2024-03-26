import { Column, Row, TextCell, HeaderCell, Id } from '@silevis/reactgrid';

export interface GenericGridProps {
  tableName: string;
}

export interface DataItem {
  [key: string]: any; 
}

export interface CustomColumn extends Column {
  columnId: Id;
  width?: number;
  resizable?: boolean;
}

export interface CustomRow extends Row {
  cells: (TextCell | HeaderCell)[];
}
