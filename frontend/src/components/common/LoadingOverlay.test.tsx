import { render } from '@testing-library/react';
import LoadingOverlay from './LoadingOverlay';

describe('LoadingOverlay', () => {
  it('should render LoadingOverlay component when isLoading is true', () => {
    const { container } = render(<LoadingOverlay isLoading={true} />);
    expect(container.querySelector('.loading-overlay')).not.toBeNull();
    expect(container.querySelector('.loading-spinner')).not.toBeNull();
  });

  it('should not render LoadingOverlay component when isLoading is false', () => {
    const { container } = render(<LoadingOverlay isLoading={false} />);
    expect(container.querySelector('.loading-overlay')).toBeNull();
    expect(container.querySelector('.loading-spinner')).toBeNull();
  });
});
