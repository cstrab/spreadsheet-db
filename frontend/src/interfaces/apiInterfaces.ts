// TODO: Update 'data' field to match possible schemas for each table instead of using 'any'
export interface ReadResponse {
    data: any[];
    columns: any[];
  }
  
// export interface UpdateDataResponse {
//     data: any[];
//   }
  
// export interface BulkUpdateDataResponse {
//     data: any[];
//   }

export interface UpdateDataPayload {
    tableName: string;
    data: any[];
    removedRowIds: string[];
  }
  
export interface BulkUpdateDataPayload {
    tableName: string;
    data: any[];
  }