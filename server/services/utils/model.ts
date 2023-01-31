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
}: {
  ids?: string[];
  algorithms?: string[];
  name?: string;
  states?: MODEL_STATE[];
  nameOrId?: string;
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
    ],
    must_not: {
      exists: {
        field: 'chunk_number',
      },
    },
  },
});

export interface UploadModel {
  name: string;
  version: string;
  description: string;
  modelFormat: string;
  modelConfig: {
    modelType: string;
    membeddingDimension: number;
    frameworkType: string;
  };
  url?: string;
}

export const convertUploadModel = ({
  name,
  version,
  description,
  modelFormat,
  modelConfig,
  url,
}: UploadModel) => ({
  name,
  version,
  description,
  model_format: modelFormat,
  model_config: {
    model_type: modelConfig.modelType,
    embedding_dimension: modelConfig.membeddingDimension,
    framework_type: modelConfig.frameworkType,
  },
  url,
});
