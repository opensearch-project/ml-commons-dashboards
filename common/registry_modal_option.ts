/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

export const MODEL_FILTER = [
  {
    label: 'tapas-tiny',

    value: 'tapas-tiny',
    'data-test-subj': 'tapas-tiny',
  },
  {
    label: 'electra-small-generator',
    value: 'electra-small-generator',
    'data-test-subj': 'electra-small-generator',
  },
  {
    label: 'flan-T5-large-grammer-synthesis',
    value: 'flan-T5-large-grammer-synthesis',
    'data-test-subj': 'flan-T5-large-grammer-synthesis',
  },
  { label: 'BEiT', value: 'BEiT', 'data-test-subj': 'BEiT' },
] as const;

export type MODEL_VALUE = typeof MODEL_FILTER[number]['value'];
