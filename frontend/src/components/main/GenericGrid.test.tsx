import { render, screen } from '@testing-library/react';
import GenericGrid from './GenericGrid'; 
import useGrid from '../../hooks/useGrid'; 
import '@testing-library/jest-dom';

jest.mock('../../hooks/useGrid');

describe('GenericGrid', () => {
    it('renders correctly with initial data', () => {
        type GridReturnValue = {
            rowData: { id: number; name: string }[];
            columnDefs: { field: string; headerName: string }[];
            isLoading: boolean;
            isFileUploaded: boolean;
            handleAddRow: () => void;
            handleRemoveRow: () => void;
            handleUpdate: () => void;
            handleFileUpload: () => void;
            onCellValueChanged: () => void;
            gridApiRef: { current: null };
        };

        (useGrid as jest.Mock).mockReturnValue({
            rowData: [{ id: 1, name: 'Test Row' }],
            columnDefs: [{ field: 'name', headerName: 'Name' }],
            isLoading: false,
            isFileUploaded: false,
            handleAddRow: jest.fn(),
            handleRemoveRow: jest.fn(),
            handleUpdate: jest.fn(),
            handleFileUpload: jest.fn(),
            onCellValueChanged: jest.fn(),
            gridApiRef: { current: null }
        } as GridReturnValue);

        render(<GenericGrid tableName="test_table" />);
        expect(screen.getByText('Displaying 1 of 1 rows')).toBeInTheDocument();
    });
});
