// TODO: Update 'data' field to match possible schemas for each table instead of using 'any'
export interface ReadResponse {
    data: any[];
    columns: any[];
  }
  
export interface UpdateResponse {
    updated_ids: { tempId: number; dbId: number }[];
  }

export interface UpdateDataPayload {
    tableName: string;
    data: any[];
    removedRowIds: string[];
  }
  
export interface BulkUpdateDataPayload {
    tableName: string;
    data: any[];
  }