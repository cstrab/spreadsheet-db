import React from 'react';
import { render } from '@testing-library/react';
import GenericGrid from './GenericGrid'; 
import useGrid from '../../hooks/useGrid'; 
import '@testing-library/jest-dom';

jest.mock('../../hooks/useGrid');

describe('GenericGrid', () => {
    it('renders correctly with initial data', () => {
        useGrid.mockReturnValue({
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
        });

        const { getByText } = render(<GenericGrid tableName="test_table" />);

        expect(getByText('Displaying 1 of 1 rows')).toBeInTheDocument();
    });
});
