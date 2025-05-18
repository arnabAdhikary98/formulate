# Formulate Testing Suite

This directory contains test files for the Formulate application. The tests are written using Jest and React Testing Library.

## Test Structure

- `__tests__/` - Contains all test files
  - `__mocks__/` - Contains mock files for static assets
  - `setup.js` - Testing library setup and global configuration
  - `test-utils.js` - Common utilities used across tests
  - `*.test.js` - Individual test files for components, services, etc.

## Running Tests

To run the tests, use the following commands:

```bash
# Run tests in watch mode (development)
npm test

# Run tests with coverage report
npm run test:coverage

# Run tests in CI mode (no watch)
npm run test:ci

# Run tests in debug mode
npm run test:debug
```

## Writing Tests

### Component Testing

For component tests, use the `renderWithProviders` utility from `test-utils.js` to render components with all necessary providers:

```javascript
import { renderWithProviders } from './test-utils';
import MyComponent from '../components/MyComponent';

describe('MyComponent', () => {
  test('renders correctly', () => {
    const { getByText } = renderWithProviders(<MyComponent />);
    expect(getByText('My Component')).toBeInTheDocument();
  });
});
```

### API Testing

For API tests, mock the axios module:

```javascript
import { myApiFunction } from '../api/myApi';
import api from '../api/axios';

jest.mock('../api/axios');

describe('MyApi', () => {
  test('makes the correct API call', async () => {
    api.get.mockResolvedValue({ data: { result: 'success' } });
    const result = await myApiFunction();
    expect(result).toEqual({ result: 'success' });
  });
});
```

## Test Coverage Requirements

The project requires a minimum of 70% test coverage for:
- Branches
- Functions
- Lines
- Statements

Run `npm run test:coverage` to see the current coverage report. 