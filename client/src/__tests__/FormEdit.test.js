import React from 'react';
import { render, screen, act, waitForElementToBeRemoved } from '@testing-library/react';
import '@testing-library/jest-dom';
import FormEdit from '../pages/FormEdit';

// Mock the API modules
jest.mock('../api/forms', () => ({
  getFormById: jest.fn(),
  updateForm: jest.fn(() => Promise.resolve({ success: true })),
  publishForm: jest.fn(() => Promise.resolve({ success: true })),
  closeForm: jest.fn(() => Promise.resolve({ success: true }))
}));

// Import the mocked modules
import { getFormById } from '../api/forms';

// Mock the dependencies
jest.mock('react-router-dom', () => ({
  useParams: () => ({ formId: 'test-form-id' }),
  useNavigate: () => jest.fn(),
  Link: ({ children, to }) => <a href={to}>{children}</a>,
}));

// Mock form data
const mockFormData = {
  _id: 'test-form-id',
  title: 'Test Form',
  description: 'Test Description',
  status: 'draft',
  uniqueUrl: 'test-form-url',
  pages: [{ title: 'Page 1', fields: [] }],
  settings: {
    collectEmail: false,
    preventDuplicateSubmissions: true,
    showProgressBar: true,
    progressBarStyle: 'default',
    allowSavingDrafts: false,
    submitButtonText: 'Submit',
    redirectUrl: '',
    webhookUrl: ''
  },
  accessCode: {
    enabled: false,
    code: ''
  }
};

// Mock the context
jest.mock('../context/AuthContext', () => ({
  AuthContext: {
    Consumer: ({ children }) => children({ isAuthenticated: true, user: { _id: 'test-user-id' } }),
  },
  useAuth: () => ({ isAuthenticated: true, user: { _id: 'test-user-id' } }),
}));

// Mock MUI date picker components
jest.mock('@mui/x-date-pickers/AdapterDateFns', () => ({
  AdapterDateFns: function AdapterDateFns() {
    return {
      date: jest.fn(() => new Date())
    };
  }
}));

jest.mock('@mui/x-date-pickers', () => ({
  LocalizationProvider: ({ children }) => <div data-testid="localization-provider">{children}</div>,
  DateTimePicker: () => <div data-testid="date-time-picker">Date Picker</div>
}));

// Mock axios
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

describe('FormEdit component', () => {
  beforeEach(() => {
    // Reset the mock before each test
    getFormById.mockReset();
  });

  test('renders error state when form loading fails', async () => {
    // Mock API call to reject with an error
    getFormById.mockRejectedValue(new Error('API error'));

    await act(async () => {
      render(<FormEdit />);
    });
    
    // Check if error message is displayed
    expect(screen.getByText('Failed to load form. Please try again.')).toBeInTheDocument();
    expect(screen.getByText('Back to Dashboard')).toBeInTheDocument();
  });

  test('renders form data when loading succeeds', async () => {
    // Mock API call to return form data
    getFormById.mockResolvedValue(mockFormData);

    await act(async () => {
      render(<FormEdit />);
    });
    
    // After loading, should show form title
    expect(await screen.findByText('Test Form')).toBeInTheDocument();
  });
}); 