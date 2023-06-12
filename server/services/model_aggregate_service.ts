/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

/*
 *   Copyright OpenSearch Contributors
 *
 *   Licensed under the Apache License, Version 2.0 (the "License").
 *   You may not use this file except in compliance with the License.
 *   A copy of the License is located at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 *   or in the "license" file accompanying this file. This file is distributed
 *   on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 *   express or implied. See the License for the specific language governing
 *   permissions and limitations under the License.
 */

import { groupBy } from 'lodash';

import { IScopedClusterClient } from '../../../../src/core/server';
import {
  MODEL_VERSION_STATE,
  ModelAggregateSort,
  ModelAggregateItem,
  ModelSort,
} from '../../common';

import { ModelService } from './model_service';
import { ModelVersionService } from './model_version_service';
import { MODEL_SEARCH_API } from './utils/constants';
import { generateModelSearchQuery } from './utils/model';

const MAX_MODEL_BUCKET_NUM = 10000;
const getModelSort = (sort: ModelAggregateSort): ModelSort => {
  switch (sort) {
    case 'owner_name-asc':
      return 'owner.name-asc';
    case 'owner_name-desc':
      return 'owner.name-desc';
    default:
      return sort;
  }
};

interface GetAggregateModelsParams {
  client: IScopedClusterClient;
  states?: MODEL_VERSION_STATE[];
}

interface ModelAggregateSearchParams extends GetAggregateModelsParams {
  client: IScopedClusterClient;
  from: number;
  size: number;
  sort?: ModelAggregateSort;
  extraQuery?: Record<string, any>;
}

export class ModelAggregateService {
  public static async getModelIdsByVersion({ client, states }: GetAggregateModelsParams) {
    const aggregateResult = await client.asCurrentUser.transport.request({
      method: 'GET',
      path: MODEL_SEARCH_API,
      body: {
        size: 0,
        query: generateModelSearchQuery({ states }),
        aggs: {
          models: {
            terms: {
              field: 'model_group_id',
              size: MAX_MODEL_BUCKET_NUM,
            },
          },
        },
      },
    });
    const models = aggregateResult.body.aggregations.models.buckets as Array<{
      key: string;
      doc_count: number;
    }>;

    return models.map(({ key }) => key);
  }

  public static async search({
    client,
    from,
    size,
    sort,
    states,
    extraQuery,
  }: ModelAggregateSearchParams) {
    const sourceModelIds = states
      ? await ModelAggregateService.getModelIdsByVersion({ client, states })
      : undefined;
    const { data: models, total_models: totalModels } = await ModelService.search({
      client,
      from,
      size,
      sort: sort ? getModelSort(sort) : sort,
      ids: sourceModelIds,
      extraQuery,
    });
    const modelIds = models.map(({ id }) => id);
    const { data: deployedModels } = await ModelVersionService.search({
      client,
      from: 0,
      size: MAX_MODEL_BUCKET_NUM,
      modelIds,
      states: [MODEL_VERSION_STATE.deployed],
    });

    const modelId2Version = groupBy(deployedModels, 'model_id');

    return {
      data: models.map((model) => ({
        ...model,
        owner_name: model.owner?.name,
        deployed_versions: (modelId2Version[model.id] || []).map(
          (deployedVersion) => deployedVersion.model_version
        ),
      })) as ModelAggregateItem[],
      total_models: totalModels,
    };
  }
}
