import { render, screen } from '@testing-library/react';
import { TablePage } from './TablePage';

jest.mock('../components/main/GenericGrid', () => {
    return function DummyGenericGrid({ tableName }: { tableName: string }) {
      return <div data-testid="genericGrid">{tableName}</div>;
    };
});

describe('TablePage', () => {
    it('should render the table name', () => {
        const tableName = 'test_table';
        render(<TablePage tableName={tableName} />);
        
        const tableNameElements = screen.getAllByText(tableName);
        expect(tableNameElements.length).toBe(2);
        });      

      it('should render the GenericGrid component', () => {
        const tableName = 'test_table';
        render(<TablePage tableName={tableName} />);

        const genericGridElement = screen.getByTestId('genericGrid');
        expect(genericGridElement).toBeInTheDocument();
        expect(genericGridElement.textContent).toBe(tableName);
    });
});
