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
  ModelGroupSort,
} from '../../common';

import { ModelGroupService } from './model_group_service';
import { ModelVersionService } from './model_version_service';
import { MODEL_SEARCH_API } from './utils/constants';
import { generateModelSearchQuery } from './utils/model';

const MAX_MODEL_BUCKET_NUM = 10000;
const getModelGroupSort = (sort: ModelAggregateSort): ModelGroupSort => {
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
  queryString?: string;
}

export class ModelAggregateService {
  public static async getModelGroupIdsByModel({ client, states }: GetAggregateModelsParams) {
    const aggregateResult = await client.asCurrentUser.transport.request({
      method: 'GET',
      path: MODEL_SEARCH_API,
      body: {
        size: 0,
        query: generateModelSearchQuery({ states }),
        aggs: {
          models: {
            terms: {
              field: 'model_group_id.keyword',
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
    queryString,
  }: ModelAggregateSearchParams) {
    const sourceModelGroupIds = states
      ? await ModelAggregateService.getModelGroupIdsByModel({ client, states })
      : undefined;
    const {
      data: modelGroups,
      total_model_groups: totalModelGroups,
    } = await ModelGroupService.search({
      client,
      from,
      size,
      sort: sort ? getModelGroupSort(sort) : sort,
      ids: sourceModelGroupIds,
      queryString,
    });
    const modelGroupIds = modelGroups.map(({ id }) => id);
    const { data: deployedModels } = await ModelVersionService.search({
      client,
      from: 0,
      size: MAX_MODEL_BUCKET_NUM,
      modelGroupIds,
      states: [MODEL_VERSION_STATE.deployed],
    });

    const modelGroupId2Model = groupBy(deployedModels, 'model_group_id');

    return {
      data: modelGroups.map((modelGroup) => ({
        ...modelGroup,
        owner_name: modelGroup.owner.name,
        deployed_versions: (modelGroupId2Model[modelGroup.id] || []).map(
          (model) => model.model_version
        ),
      })) as ModelAggregateItem[],
      total_models: totalModelGroups,
    };
  }
}
