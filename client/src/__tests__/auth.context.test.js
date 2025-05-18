import React from 'react';
import { render, screen } from '@testing-library/react';
import { AuthContext, AuthProvider } from '../context/AuthContext';

// Mock modules
jest.mock('../api/auth', () => ({
  login: jest.fn(),
  register: jest.fn(),
}));

jest.mock('jwt-decode', () => ({
  jwtDecode: jest.fn(() => ({ exp: Date.now() / 1000 + 3600 }))
}));

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn(key => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn(key => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
  });

  test('should initialize without a user', () => {
    const TestComponent = () => {
      const context = React.useContext(AuthContext);
      return (
        <div>
          <div data-testid="isAuthenticated">{context.isAuthenticated.toString()}</div>
          <div data-testid="user">{JSON.stringify(context.user)}</div>
        </div>
      );
    };

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('isAuthenticated').textContent).toBe('false');
    expect(screen.getByTestId('user').textContent).toBe('null');
  });
}); 