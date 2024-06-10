import { render, screen } from '@testing-library/react';
import { HomePage } from './HomePage';

describe('HomePage', () => {
    it('should render without crashing', () => {
      render(<HomePage />);
      expect(screen.getByText('Welcome to spreadsheet-db')).toBeInTheDocument();
      expect(screen.getByText('This is an application allowing users to perform CRUD (Create, Read, Update, and Delete) operations on relational database tables through an excel-like user interface.')).toBeInTheDocument();
    });
});
