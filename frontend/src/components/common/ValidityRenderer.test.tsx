import { render, screen } from '@testing-library/react';
import ValidityRenderer from './ValidityRenderer';

describe('ValidityRenderer', () => {
    it('should render "Valid" when isValid is true', () => {
      const props = {
        ...jest.fn()(),
        data: {
          isValid: true,
        },
      };

      render(<ValidityRenderer {...props} />);
      expect(screen.getByText('Valid')).toBeInTheDocument();
    });

    it('should render "Invalid" when isValid is false', () => {
      const props = {
        ...jest.fn()(),
        data: {
          isValid: false,
        },
      };

      render(<ValidityRenderer {...props} />);
      expect(screen.getByText('Invalid')).toBeInTheDocument();
    });
});
