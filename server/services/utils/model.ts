/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { MODEL_STATE } from '../../../common';
import { generateTermQuery } from './query';

export const generateModelSearchQuery = ({
  states,
  nameOrId,
  exclude,
}: {
  states?: MODEL_STATE[];
  nameOrId?: string;
  exclude?: 'REMOTE_MODEL';
}) => ({
  bool: {
    must: [
      ...(states ? [generateTermQuery('model_state', states)] : []),
      ...(nameOrId
        ? [
            {
              bool: {
                should: [
                  {
                    wildcard: {
                      'name.keyword': { value: `*${nameOrId}*`, case_insensitive: true },
                    },
                  },
                  generateTermQuery('_id', nameOrId),
                ],
              },
            },
          ]
        : []),
    ],
    must_not: [
      {
        exists: {
          field: 'chunk_number',
        },
      },
      ...(exclude === 'REMOTE_MODEL'
        ? [
            {
              term: {
                algorithm: 'REMOTE',
              },
            },
          ]
        : []),
    ],
  },
});
