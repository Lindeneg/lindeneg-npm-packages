module.exports = {
  roots: ['<rootDir>'],
  testEnvironment: 'jsdom',
  testMatch: ['**/__tests__/**/*.test.+(ts|tsx|js)'],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  globals: {
    'ts-jest': {
      tsconfig: './tsconfig-test.json',
    },
  },
  verbose: true,
  collectCoverage: true,
  collectCoverageFrom: ['**/src/*.ts'],
  coverageReporters: ['lcov', 'text'],
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 90,
      lines: 90,
    },
  },
};
