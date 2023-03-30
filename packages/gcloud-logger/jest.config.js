module.exports = {
  testEnvironment: 'node',
  testPathIgnorePatterns: [
    '/node_modules/',
    'dist',
    '.eslintrc.js',
  ],
  runtime: '@side/jest-runtime',
  transform: {
    '^.+\\.tsx?$': '@swc/jest',
  },
  testTimeout: 30000,
}
