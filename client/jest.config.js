module.exports = {
  testEnvironment: 'jsdom',
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/src/**/*.{spec,test}.{js,jsx,ts,tsx}',
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/__mocks__/styleMock.js',
    '/__mocks__/fileMock.js',
    '/__mocks__/axios.js',
    '/__mocks__/axiosMock.js',
    '/__mocks__/api-axios.js',
    '/__mocks__/react-router-dom.js',
  ],
  moduleNameMapper: {
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/src/__tests__/__mocks__/fileMock.js',
    '\\.(css|less|scss|sass)$': '<rootDir>/src/__tests__/__mocks__/styleMock.js',
  },
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest'
  },
  transformIgnorePatterns: [
    '/node_modules/(?!(axios|date-fns|@mui)).+\\.js$'
  ],
  collectCoverageFrom: ['src/**/*.{js,jsx,ts,tsx}', '!src/**/*.d.ts'],
  coverageThreshold: {
    global: {
      statements: 10,
      branches: 10,
      functions: 10,
      lines: 10,
    },
  },
  clearMocks: true,
}; 