import { render } from '@testing-library/react';
import ValidityRenderer from './ValidityRenderer';

describe('ValidityRenderer', () => {
    it('should render "Valid" when isValid is true', () => {
      const props = {
        ...jest.fn()(),
        data: {
          isValid: true,
        },
      };

      const { getByText } = render(<ValidityRenderer {...props} />);
      expect(getByText('Valid')).toBeInTheDocument();
    });

    it('should render "Invalid" when isValid is false', () => {
      const props = {
        ...jest.fn()(),
        data: {
          isValid: false,
        },
      };

      const { getByText } = render(<ValidityRenderer {...props} />);
      expect(getByText('Invalid')).toBeInTheDocument();
    });
});
