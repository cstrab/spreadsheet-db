import { checkInvalidCell, checkRowValidity } from './validation';

describe('checkInvalidCell', () => {
  it('should return false for null values', () => {
    expect(checkInvalidCell(null, 'integer')).toBe(false);
  });

  it('should validate integer values correctly', () => {
    expect(checkInvalidCell('123', 'integer')).toBe(false);
    expect(checkInvalidCell('123.45', 'integer')).toBe(true);
  });

  it('should validate float values correctly', () => {
    expect(checkInvalidCell('123.45', 'float')).toBe(false);
    expect(checkInvalidCell('abc', 'float')).toBe(true);
  });

  it('should validate varchar values correctly', () => {
    expect(checkInvalidCell('abc', 'varchar')).toBe(false);
    expect(checkInvalidCell(123, 'varchar')).toBe(true);
  });

  it('should validate boolean values correctly', () => {
    expect(checkInvalidCell(true, 'boolean')).toBe(false);
    expect(checkInvalidCell('true', 'boolean')).toBe(false);
    expect(checkInvalidCell('abc', 'boolean')).toBe(true);
  });

  it('should validate date values correctly', () => {
    expect(checkInvalidCell('2020-01-01', 'date')).toBe(false);
    expect(checkInvalidCell('01-01-2020', 'date')).toBe(true);
  });

  it('should validate datetime values correctly', () => {
    expect(checkInvalidCell('2020-01-01T12:00:00', 'datetime')).toBe(false);
    expect(checkInvalidCell('2020-01-01 12:00:00', 'datetime')).toBe(true);
  });
});

describe('checkRowValidity', () => {
    const columns = [
        { field: 'header1', cellDataTypeAPI: 'integer' },
        { field: 'header2', cellDataTypeAPI: 'float' },
        { field: 'header3', cellDataTypeAPI: 'varchar' },
        { field: 'header4', cellDataTypeAPI: 'boolean' },
        { field: 'header5', cellDataTypeAPI: 'date' },
        { field: 'header6', cellDataTypeAPI: 'datetime' },
    ];

    it('should return true for valid rows', () => {
        const row = {
            header1: '123',
            header2: '123.45',
            header3: 'abc',
            header4: 'true',
            header5: '2020-01-01',
            header6: '2020-01-01T12:00:00',
        };

        expect(checkRowValidity(row, columns)).toBe(true);
    });

    it('should return false for invalid integer', () => {
        const row = {
            header1: '123.45',
            header2: '123.45',
            header3: 'abc',
            header4: 'true',
            header5: '2020-01-01',
            header6: '2020-01-01T12:00:00',
        };

        expect(checkRowValidity(row, columns)).toBe(false);
    });

    it('should return false for invalid float', () => {
        const row = {
            header1: '123',
            header2: 'abc',
            header3: 'abc',
            header4: 'true',
            header5: '2020-01-01',
            header6: '2020-01-01T12:00:00',
        };

        expect(checkRowValidity(row, columns)).toBe(false);
    });

    it('should return false for invalid varchar', () => {
        const row = {
            header1: '123',
            header2: '123.45',
            header3: 123,
            header4: 'true',
            header5: '2020-01-01',
            header6: '2020-01-01T12:00:00',
        };

        expect(checkRowValidity(row, columns)).toBe(false);
    });

    it('should return false for invalid boolean', () => {
        const row = {
            header1: '123',
            header2: '123.45',
            header3: 'abc',
            header4: 'abc',
            header5: '2020-01-01',
            header6: '2020-01-01T12:00:00',
        };

        expect(checkRowValidity(row, columns)).toBe(false);
    });

    it('should return false for invalid date', () => {
        const row = {
            header1: '123',
            header2: '123.45',
            header3: 'abc',
            header4: 'true',
            header5: '01-01-2020',
            header6: '2020-01-01T12:00:00',
        };

        expect(checkRowValidity(row, columns)).toBe(false);
    });    

    it('should return false for invalid datetime', () => {
        const row = {
            header1: '123',
            header2: '123.45',
            header3: 'abc',
            header4: 'true',
            header5: '2020-01-01',
            header6: '2020-01-01 12:00:00',
        };

        expect(checkRowValidity(row, columns)).toBe(false);
    });

    it('should return true for rows with null fields', () => {
        const row = {
            header1: null,
            header2: '123.45',
            header3: null,
            header4: 'true',
            header5: '2020-01-01',
            header6: '2020-01-01T12:00:00',
        };

        expect(checkRowValidity(row, columns)).toBe(true);
    });

    it('should return true for rows with extra fields', () => {
        const row = {
            header1: '123',
            header2: '123.45',
            header3: 'abc',
            header4: 'true',
            header5: '2020-01-01',
            header6: '2020-01-01T12:00:00',
            extraField: 'extra value',
        };

        expect(checkRowValidity(row, columns)).toBe(true);
    });
});