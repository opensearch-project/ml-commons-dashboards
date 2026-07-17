/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

module.exports = {
  rootDir: '../',
  setupFiles: ['<rootDir>/test/setupTests.ts'],
  setupFilesAfterEnv: ['jest-location-mock', '<rootDir>/test/setup.jest.ts'],
  roots: ['<rootDir>'],
  moduleNameMapper: {
    '\\.(css|less|scss)$': '<rootDir>/test/mocks/styleMock.ts',
    '^ui/(.*)': '<rootDir>/../../src/legacy/ui/public/$1/',
    // query-string v9 is pure ESM; this shim restores the default-import shape
    // (`import qs from 'query-string'`) under Jest's CJS transform.
    '^query-string$': '<rootDir>/test/mocks/queryStringMock.js',
  },
  testMatch: ['**/*.test.{js,mjs,ts,tsx}'],
  testPathIgnorePatterns: ['<rootDir>/target/', '<rootDir>/node_modules/', '<rootDir>/build/'],
  collectCoverageFrom: [
    '<rootDir>/public/**/*.{ts,tsx}',
    '!<rootDir>/public/**/*.test.{ts,tsx}',
    '!<rootDir>/public/**/*.types.ts',
    '<rootDir>/server/**/*.{ts,tsx}',
    '!<rootDir>/server/**/*.test.{ts,tsx}',
    '!<rootDir>/server/**/*.mock.{ts,tsx}',
  ],
  coverageDirectory: './coverage',
  coverageReporters: ['lcov', 'text', 'cobertura', 'html'],
  transform: {
    '^.+\\.(js|tsx?)$': '<rootDir>/../../src/dev/jest/babel_transform.js',
  },
  transformIgnorePatterns: [
    // ignore all node_modules except query-string and its pure-ESM deps, which
    // require babel transforms since ESM is not natively supported by Jest's CJS runtime.
    '[/\\\\]node_modules(?![\\/\\\\](query-string|decode-uri-component|filter-obj|split-on-first))[/\\\\].+\\.js$',
  ],
  testEnvironment: 'jsdom',
  testEnvironmentOptions: {
    // Set the default URL so window.location.origin is 'http://localhost:5601' rather than
    // 'http://localhost', avoiding the need for tests to mock window.location.origin.
    url: 'http://localhost:5601',
  },
  // Retain Jest 28 snapshot defaults; Jest 29 flipped escapeString and printBasicPrototype to false,
  // which would invalidate existing snapshots. See https://jestjs.io/docs/29.0/upgrading-to-jest29
  snapshotFormat: {
    escapeString: true,
    printBasicPrototype: true,
  },
};
