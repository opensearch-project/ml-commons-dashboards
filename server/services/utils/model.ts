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
  ids,
  algorithms,
  name,
  states,
  nameOrId,
  extraQuery,
  versionOrKeyword,
}: {
  ids?: string[];
  algorithms?: string[];
  name?: string;
  states?: MODEL_STATE[];
  nameOrId?: string;
  extraQuery?: Record<string, any>;
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
    ],
    must_not: {
      exists: {
        field: 'chunk_number',
      },
    },
  },
});
