/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

export const fixTwoDecimalPoint = (value: string) => {
  return value.replace(/^(\-)*(\d+)\.(\d\d).*$/, '$1$2.$3');
};
