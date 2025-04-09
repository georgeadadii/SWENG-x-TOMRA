module.exports = {
  testEnvironment: 'jsdom', 
  setupFilesAfterEnv: ['<rootDir>/setupTests.js'], 
  transform: {
    '^.+\\.(ts|tsx)$': 'babel-jest', 
    '^.+\\.(js|jsx)$': 'babel-jest', 
  },
  transformIgnorePatterns: [
    'node_modules/(?!lucide-react)', 
  ],
  moduleNameMapper: {
    '^@/lib/apolloClient$': '<rootDir>/__mocks__/apolloClient.ts', 
    '^@/(.*)$': '<rootDir>/src/$1', 
    '^__mocks__/(.*)$': '<rootDir>/__mocks__/$1', 
    '^next/font/google$': '<rootDir>/__mocks__/next/font/google.js', 
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
};