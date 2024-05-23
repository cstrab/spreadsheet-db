import { render, fireEvent, screen } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Header } from './Header';

describe('Header', () => {
  it('should render Header component and handle click events', () => {
    render(
      <Router>
        <Header pageTitle="spreadsheet-db" />
      </Router>
    );

    expect(screen.getByText(/spreadsheet-db/i)).toBeInTheDocument();

    fireEvent.click(screen.getByText(/Tables/i));

    const menuItems = screen.queryAllByRole('menuitem');
    expect(menuItems.length).toBeGreaterThan(0);
  });
});
