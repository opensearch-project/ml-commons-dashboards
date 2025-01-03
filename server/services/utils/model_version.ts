/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { MODEL_VERSION_STATE } from '../../../common';
import { generateTermQuery } from './query';

export const generateModelVersionSearchQuery = ({
  ids,
  algorithms,
  name,
  states,
  nameOrId,
  modelIds,
  versionOrKeyword,
  extraQuery,
}: {
  ids?: string[];
  algorithms?: string[];
  name?: string;
  states?: MODEL_VERSION_STATE[];
  nameOrId?: string;
  extraQuery?: Record<string, any>;
  versionOrKeyword?: string;
  modelIds?: string[];
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
      ...(extraQuery ? [extraQuery] : []),
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
      ...(modelIds ? [generateTermQuery('model_group_id', modelIds)] : []),
    ],
    must_not: {
      exists: {
        field: 'chunk_number',
      },
    },
  },
});
