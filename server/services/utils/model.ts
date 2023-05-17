/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { MODEL_STATE } from '../../../common';
import { generateTermQuery } from './query';

export const generateModelSearchQuery = ({
  ids,
  algorithms,
  name,
  states,
  nameOrId,
  versionOrKeyword,
}: {
  ids?: string[];
  algorithms?: string[];
  name?: string;
  states?: MODEL_STATE[];
  nameOrId?: string;
  versionOrKeyword?: string;
}) => ({
  bool: {
    must: [
      ...(ids ? [{ ids: { values: ids } }] : []),
      ...(algorithms ? [generateTermQuery('algorithm', algorithms)] : []),
      ...(name
        ? [
            {
              term: {
                'name.keyword': name,
              },
            },
          ]
        : []),
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
      ...(versionOrKeyword
        ? [
            {
              bool: {
                should: [
                  {
                    wildcard: {
                      model_version: {
                        value: `*${versionOrKeyword}*`,
                        case_insensitive: true,
                      },
                    },
                  },
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
