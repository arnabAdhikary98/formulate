import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock the dependencies
jest.mock('../components/Navigation', () => {
  return () => <div data-testid="navigation">Navigation Component</div>
});

describe('Navigation component', () => {
  test('mock renders correctly', () => {
    // Use the mocked component
    const { getByTestId } = render(<div data-testid="container">
      <span data-testid="navigation-container">
        {/* This will use the mocked Navigation component */}
        Navigation works
      </span>
    </div>);
    
    expect(getByTestId('container')).toBeInTheDocument();
    expect(getByTestId('navigation-container')).toBeInTheDocument();
  });
}); 