import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import RemoveButtonRenderer from './RemoveButtonRenderer';

describe('RemoveButtonRenderer', () => {
    it('should render RemoveButtonRenderer component and handles click events', () => {
            const handleRemoveRow = jest.fn();
            const context = { handleRemoveRow, isFileUploaded: false };
            const props = {
            ...jest.fn()(),
            context,
            };

            const { getByText } = render(<RemoveButtonRenderer {...props} />);

            expect(getByText(/Remove/i)).toBeInTheDocument();
            fireEvent.click(getByText(/Remove/i));
            expect(handleRemoveRow).toHaveBeenCalled();
    });

    it('should render RemoveButtonRenderer component and button should be disabled and not clickable', () => {
        const handleRemoveRow = jest.fn();
        const context = { handleRemoveRow, isFileUploaded: true };
        const props = {
        ...jest.fn()(),
        context,
        };

        const { getByText } = render(<RemoveButtonRenderer {...props} />);

        expect(getByText(/Remove/i)).toBeInTheDocument();
        fireEvent.click(getByText(/Remove/i));
        expect(handleRemoveRow).not.toHaveBeenCalled();
    });
});
