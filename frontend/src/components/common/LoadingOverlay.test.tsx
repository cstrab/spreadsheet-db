import { render, screen } from '@testing-library/react';
import LoadingOverlay from './LoadingOverlay';

describe('LoadingOverlay', () => {
  it('should render LoadingOverlay component when isLoading is true', () => {
    render(<LoadingOverlay isLoading={true} />);
    const loadingOverlay = screen.getByTestId('loading-overlay');
    expect(loadingOverlay).toBeInTheDocument();
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('should not render LoadingOverlay component when isLoading is false', () => {
    render(<LoadingOverlay isLoading={false} />);
    expect(screen.queryByTestId('loading-overlay')).not.toBeInTheDocument();
  });
});
