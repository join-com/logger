module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testPathIgnorePatterns: ['/node_modules/', '/support/'],
  resetMocks: true,
  globals: {
    'ts-jest': {
      diagnostics: false,
    },
  },
}
