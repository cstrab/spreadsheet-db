import { parseXLSX } from './xlsxParser';
import * as XLSX from 'xlsx';

class MockFileReader {
  onload: any;
  readAsBinaryString(file: File) {
    this.onload({
      target: { result: 'mock binary string' },
    });
  }
}

global.FileReader = MockFileReader as any;

describe('parseXLSX', () => {
  beforeEach(() => {
    jest.spyOn(XLSX, 'read').mockImplementation(() => ({
      SheetNames: ['Sheet1'],
      Sheets: {
        Sheet1: {},
      },
    }));

    XLSX.utils.sheet_to_json = jest.fn().mockReturnValue([
      ['header1', 'header2'],
      ['row1col1', 'row1col2'],
      ['row2col1', 'row2col2'],
    ]);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should parse the XLSX file correctly', async () => {
    const mockFile = new File([''], 'filename.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const columnDefs = [{ field: 'header1' }, { field: 'header2' }];

    const result = await parseXLSX(mockFile, columnDefs);

    expect(result).toEqual({
      data: [
        { header1: 'row1col1', header2: 'row1col2', id: -1 },
        { header1: 'row2col1', header2: 'row2col2', id: -2 },
      ],
      isValid: true,
    });
  });

  it('should return empty data if the headers do not match', async () => {
    const mockFile = new File([''], 'filename.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const columnDefs = [{ field: 'header1' }, { field: 'header3' }];

    const result = await parseXLSX(mockFile, columnDefs);

    expect(result).toEqual({
      data: [],
      isValid: false,
    });
  });

  it('should return empty data if the file is empty', async () => {
    const mockFile = new File([''], 'filename.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const columnDefs = [{ field: 'header1' }, { field: 'header2' }];

    XLSX.utils.sheet_to_json = jest.fn().mockReturnValue([]);

    const result = await parseXLSX(mockFile, columnDefs);

    expect(result).toEqual({
      data: [],
      isValid: false,
    });
  });

  it('should convert cell values "true" and "false" to boolean values', async () => {
    const mockFile = new File([''], 'filename.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const columnDefs = [{ field: 'header1' }, { field: 'header2' }];
  
    XLSX.utils.sheet_to_json = jest.fn().mockReturnValue([
      ['header1', 'header2'],
      ['true', 'false'],
    ]);
  
    const result = await parseXLSX(mockFile, columnDefs);
  
    expect(result).toEqual({
      data: [
        { header1: true, header2: false, id: -1 },
      ],
      isValid: true,
    });
  });
});
