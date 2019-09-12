module.exports = {
  preset: 'ts-jest',
  roots: ['<rootDir>/__tests__/src'],
  transform: {
    '^.+\\.ts?$': 'ts-jest',
  },
  globals: {
    'ts-jest': {
      diagnostics: false,
    },
  },
};
