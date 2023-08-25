/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { MODEL_STATE } from '../../../common';
import { generateTermQuery } from './query';

export const generateModelSearchQuery = ({
  states,
  nameOrId,
  extraQuery,
}: {
  states?: MODEL_STATE[];
  nameOrId?: string;
  extraQuery?: Record<string, any>;
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
      ...(extraQuery ? [extraQuery] : []),
    ],
    must_not: {
      exists: {
        field: 'chunk_number',
      },
    },
  },
});
