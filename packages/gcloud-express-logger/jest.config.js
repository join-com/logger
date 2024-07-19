module.exports = {
  testEnvironment: 'node',
  testPathIgnorePatterns: ['/node_modules/', 'dist', '.eslintrc.js', '/support/'],
  runtime: '@side/jest-runtime',
  transform: { '^.+\\.tsx?$': '@swc/jest' },
}
