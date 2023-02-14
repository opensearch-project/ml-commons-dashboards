/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

module.exports = {
  rootDir: '../',
  setupFiles: ['<rootDir>/test/setupTests.ts'],
  setupFilesAfterEnv: ['<rootDir>/test/setup.jest.ts'],
  roots: ['<rootDir>'],
  moduleNameMapper: {
    '\\.(css|less|scss|svg)$': '<rootDir>/test/mocks/styleMock.ts',
    '^ui/(.*)': '<rootDir>/../../src/legacy/ui/public/$1/',
  },
  testMatch: ['**/*.test.{js,mjs,ts,tsx}'],
  testPathIgnorePatterns: ['<rootDir>/target/', '<rootDir>/node_modules/'],
  transform: {
    '^.+\\.(js|tsx?)$': '<rootDir>/../../src/dev/jest/babel_transform.js',
  },
  testEnvironment: 'jsdom',
};
