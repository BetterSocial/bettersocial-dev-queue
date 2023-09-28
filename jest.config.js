const mongodb_preset = require('@shelf/jest-mongodb/jest-preset');

/** @type {import('@jest/types').Config.InitialOptions} */
const config = {
  verbose: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['lcov', 'text'],
  collectCoverageFrom: ['<rootDir>/src/**/*.js'],

  projects: [
    {
      displayName: 'api',
      ...mongodb_preset,
      setupFiles: ['<rootDir>/__tests__/__setups__/env.js'],
      setupFilesAfterEnv: ['<rootDir>/__tests__/api/setupTest.js'],
      testMatch: ['<rootDir>/__tests__/api/**/*.test.js'],
      coveragePathIgnorePatterns: ['<rootDir>/src/server.js']
    },
    {
      displayName: 'process',
      ...mongodb_preset,
      setupFiles: ['<rootDir>/__tests__/__setups__/env.js'],
      testMatch: ['<rootDir>/__tests__/process/**/*.test.js'],
      coveragePathIgnorePatterns: ['<rootDir>/src/server.js']
    },
    {
      displayName: 'unit',
      testMatch: ['<rootDir>/src/**/*.test.js'],
      coveragePathIgnorePatterns: ['<rootDir>/src/server.js']
    }
  ]
};

module.exports = config;
