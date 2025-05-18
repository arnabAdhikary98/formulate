// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock modules that are used across tests
jest.mock('@mui/x-date-pickers/AdapterDateFns', () => ({
  AdapterDateFns: function AdapterDateFns() {
    return {
      date: jest.fn(() => new Date())
    };
  }
}));

jest.mock('@mui/x-date-pickers', () => ({
  LocalizationProvider: ({ children }) => children,
  DateTimePicker: () => null
})); 