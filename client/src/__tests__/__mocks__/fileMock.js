// This file is a mock for file imports
module.exports = 'test-file-stub';

// Add a test to prevent the "no test found" error
describe('File Mock', () => {
  test('dummy test to avoid empty test suite error', () => {
    expect(true).toBe(true);
  });
}); 