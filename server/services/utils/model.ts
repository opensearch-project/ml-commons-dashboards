/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { MODEL_STATE } from '../../../common';
import { generateTermQuery } from './query';

export const convertModelSource = (source: {
  model_content: string;
  name: string;
  algorithm: string;
  model_state: string;
  model_version: string;
}) => ({
  content: source.model_content,
  name: source.name,
  algorithm: source.algorithm,
  state: source.model_state,
  version: source.model_version,
});

export const generateModelSearchQuery = ({
  states,
  nameOrId,
}: {
  states?: MODEL_STATE[];
  nameOrId?: string;
}) => ({
  bool: {
    must: [
      ...(states ? [generateTermQuery('model_state', states)] : []),
      ...(nameOrId
        ? [
            {
              bool: {
                should: [
                  { wildcard: { name: { value: `*${nameOrId}*` } } },
                  generateTermQuery('_id', nameOrId),
                ],
              },
            },
          ]
        : []),
    ],
    must_not: {
      exists: {
        field: 'chunk_number',
      },
    },
  },
});
