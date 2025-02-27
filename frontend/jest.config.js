// module.exports = {
//   testEnvironment: 'jsdom',
//   setupFilesAfterEnv: ['<rootDir>/setupTests.js'],
//   transform: {
//     '^.+\\.(ts|tsx)$': 'babel-jest',
//   },
//   transformIgnorePatterns: [
//     'node_modules/(?!lucide-react)',
//     '/node_modules/(?!your-package-to-transform|another-package).+\\.js$' 
//   ],
//   moduleNameMapper: {
//     "^@/lib/apolloClient$": "<rootDir>/__mocks__/apolloClient.ts", // Mock Apollo Client
//     "^@/(.*)$": "<rootDir>/src/$1",
//     "^next/font/google$": "<rootDir>/__mocks__/next/font/google.js",
//   },
//   moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'], 
// };

module.exports = {
  testEnvironment: 'jsdom', // Use jsdom for browser-like environment
  setupFilesAfterEnv: ['<rootDir>/setupTests.js'], // Setup files after the environment is loaded
  transform: {
    '^.+\\.(ts|tsx)$': 'babel-jest', // Transform TypeScript files using babel-jest
    '^.+\\.(js|jsx)$': 'babel-jest', // Add this to transform JavaScript files as well
  },
  transformIgnorePatterns: [
    'node_modules/(?!lucide-react)', // Ensure lucide-react is transformed
  ],
  moduleNameMapper: {
    '^@/lib/apolloClient$': '<rootDir>/__mocks__/apolloClient.ts', // Mock Apollo Client
    '^@/(.*)$': '<rootDir>/src/$1', // Map @/ to src/
    '^__mocks__/(.*)$': '<rootDir>/__mocks__/$1', // Map __mocks__ to the root __mocks__ folder
    '^next/font/google$': '<rootDir>/__mocks__/next/font/google.js', // Mock next/font/google
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'], // Include all necessary file extensions
};