/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

export const STATUS_FILTER = [
  {
    label: 'Responsive',
    color: '#017D73',
    value: 'responding',
  },
  { label: 'Partially responsive', color: '#F5A700', value: 'partial-responding' },
  { label: 'Not responsive', color: '#BD271E', value: 'not-responding' },
] as const;

export type STATUS_VALUE = typeof STATUS_FILTER[number]['value'];
