/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

const osdConfig = require('@elastic/eslint-config-kibana');
const { eui } = require('@elastic/eslint-config-kibana/extras');

module.exports = [
  // Replaces .eslintignore (ESLint 10 no longer reads it).
  { ignores: ['node_modules', 'data', 'optimize', 'build', 'target'] },
  ...osdConfig,
  ...eui,
];
