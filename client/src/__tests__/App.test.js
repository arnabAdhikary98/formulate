import React from 'react';
import { render, screen } from '@testing-library/react';
import App from '../App';

// Mock axios and api
jest.mock('axios', () => ({
  create: jest.fn(() => ({
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() }
    },
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn()
  }))
}));

// Mock the API module that uses axios
jest.mock('../api/axios', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() }
    }
  }
}));

// Mock the Router and other dependencies
jest.mock('react-router-dom', () => ({
  BrowserRouter: ({ children }) => <div data-testid="router">{children}</div>,
  Routes: ({ children }) => <div data-testid="routes">{children}</div>,
  Route: () => <div data-testid="route"></div>,
  Navigate: () => <div data-testid="navigate"></div>,
}));

jest.mock('@mui/material/styles', () => ({
  ThemeProvider: ({ children }) => <div data-testid="theme-provider">{children}</div>,
  createTheme: () => ({ palette: {}, typography: {} }),
  responsiveFontSizes: (theme) => theme,
}));

jest.mock('@mui/material', () => ({
  CssBaseline: () => <div data-testid="css-baseline"></div>,
}));

// Mock context
jest.mock('../context/AuthContext', () => ({
  AuthProvider: ({ children }) => <div data-testid="auth-provider">{children}</div>,
}));

// Mock components
jest.mock('../utils/PrivateRoute', () => {
  return ({ children }) => <div data-testid="private-route">{children}</div>;
});

jest.mock('../components/Navigation', () => {
  return () => <div data-testid="navigation">Navigation Bar</div>;
});

// Mock all page components individually
jest.mock('../pages/HomePage', () => {
  return () => <div data-testid="page-home">Home Page</div>;
});

jest.mock('../pages/Login', () => {
  return () => <div data-testid="page-login">Login Page</div>;
});

jest.mock('../pages/Register', () => {
  return () => <div data-testid="page-register">Register Page</div>;
});

jest.mock('../pages/Dashboard', () => {
  return () => <div data-testid="page-dashboard">Dashboard Page</div>;
});

jest.mock('../pages/FormBuilder', () => {
  return () => <div data-testid="page-form-builder">Form Builder Page</div>;
});

jest.mock('../pages/FormEdit', () => {
  return () => <div data-testid="page-form-edit">Form Edit Page</div>;
});

jest.mock('../pages/FormResponses', () => {
  return () => <div data-testid="page-form-responses">Form Responses Page</div>;
});

jest.mock('../pages/FormPreview', () => {
  return () => <div data-testid="page-form-preview">Form Preview Page</div>;
});

jest.mock('../pages/PublicForm', () => {
  return () => <div data-testid="page-public-form">Public Form Page</div>;
});

jest.mock('../pages/ThankYou', () => {
  return () => <div data-testid="page-thank-you">Thank You Page</div>;
});

jest.mock('../pages/Profile', () => {
  return () => <div data-testid="page-profile">Profile Page</div>;
});

describe('App component', () => {
  test('renders basic structure', () => {
    render(<App />);
    
    // Check that the auth provider is rendered
    expect(screen.getByTestId('auth-provider')).toBeInTheDocument();
    
    // Check that the navigation is rendered
    expect(screen.getByTestId('navigation')).toBeInTheDocument();
  });
}); 