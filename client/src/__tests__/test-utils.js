import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';

// Mock the AuthContext to avoid dependency on axios
jest.mock('../context/AuthContext', () => ({
  AuthContext: {
    Provider: ({ children, value }) => <div>{children}</div>,
    Consumer: ({ children }) => children({ isAuthenticated: true, user: null }),
  },
}));

// Create a theme for testing
const theme = createTheme({
  palette: {
    primary: {
      main: '#2196f3',
    },
    secondary: {
      main: '#f50057',
    },
  },
});

// Default auth context values
const defaultAuthContext = {
  user: null,
  isAuthenticated: false,
  loading: false,
  login: jest.fn(),
  logout: jest.fn(),
  register: jest.fn(),
  token: null,
  error: null,
  clearError: jest.fn(),
};

// Render with all providers
export const renderWithProviders = (
  ui,
  {
    authProviderProps = {},
    ...renderOptions
  } = {}
) => {
  const AllProviders = ({ children }) => {
    return (
      <ThemeProvider theme={theme}>
        <BrowserRouter>{children}</BrowserRouter>
      </ThemeProvider>
    );
  };

  return render(ui, { wrapper: AllProviders, ...renderOptions });
};

// Render with ThemeProvider
export const renderWithTheme = (ui, options) => {
  return render(
    <ThemeProvider theme={theme}>{ui}</ThemeProvider>,
    options
  );
};

// Mock response object
export const createMockResponse = (data = {}) => ({
  _id: 'resp123',
  formId: 'form123',
  respondent: { email: 'test@example.com', name: 'Test User' },
  answers: [],
  submittedAt: new Date().toISOString(),
  ...data,
});

// Mock form object
export const createMockForm = (data = {}) => ({
  _id: 'form123',
  title: 'Test Form',
  description: 'A test form',
  fields: [
    {
      id: 'field1',
      type: 'text',
      label: 'Name',
      required: true,
      placeholder: 'Enter your name',
    },
    {
      id: 'field2',
      type: 'email',
      label: 'Email',
      required: true,
      placeholder: 'Enter your email',
    },
  ],
  createdBy: 'user123',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...data,
});

export const mockFetch = (mockData) => {
  global.fetch = jest.fn().mockImplementation(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve(mockData),
    })
  );
};

describe('Test Utilities', () => {
  test('dummy test to avoid empty test suite error', () => {
    expect(true).toBe(true);
  });
}); 