import { render } from '@testing-library/react';
import { HomePage } from './HomePage';

describe('HomePage', () => {
  it('should render without crashing', () => {
    const { getByText } = render(<HomePage />);
    
    expect(getByText('Welcome to spreadsheet-db')).toBeInTheDocument();
    expect(getByText('This is an application allowing users to perform CRUD (Create, Read, Update, and Delete) operations on relational database tables through an excel-like user interface.')).toBeInTheDocument();
  });
});
