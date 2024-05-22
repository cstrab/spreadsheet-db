import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

describe('App', () => {
  it('should render App component', () => {
    render(<App />);

    const elements = screen.getAllByText(/spreadsheet-db/i);
    expect(elements.length).toBeGreaterThan(0);
  });
});
