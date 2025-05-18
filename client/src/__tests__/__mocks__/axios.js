// Mock for axios
const axios = {
  create: jest.fn(() => ({
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() }
    },
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn()
  })),
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn()
};

module.exports = axios;

// Add a test to prevent the "no test found" error
describe('Axios Mock', () => {
  test('dummy test to avoid empty test suite error', () => {
    expect(true).toBe(true);
  });
}); 