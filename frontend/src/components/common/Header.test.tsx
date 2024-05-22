import { render, fireEvent } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Header } from './Header';

describe('Header', () => {
  it('should render Header component and handle click events', () => {
    const { getByText, queryAllByRole } = render(
      <Router>
        <Header pageTitle="spreadsheet-db" />
      </Router>
    );

    expect(getByText(/spreadsheet-db/i)).toBeInTheDocument();

    fireEvent.click(getByText(/Tables/i));

    const menuItems = queryAllByRole('menuitem');
    expect(menuItems.length).toBeGreaterThan(0);
  });
});
