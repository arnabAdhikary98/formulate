// Mock for the API axios instance
const apiAxios = {
  interceptors: {
    request: { use: jest.fn() },
    response: { use: jest.fn() }
  },
  get: jest.fn().mockImplementation(() => Promise.resolve({ data: {} })),
  post: jest.fn().mockImplementation(() => Promise.resolve({ data: {} })),
  put: jest.fn().mockImplementation(() => Promise.resolve({ data: {} })),
  delete: jest.fn().mockImplementation(() => Promise.resolve({ data: {} }))
};

module.exports = apiAxios;

// Add a test to prevent the "no test found" error
describe('API Axios Mock', () => {
  test('dummy test to avoid empty test suite error', () => {
    expect(true).toBe(true);
  });
}); 