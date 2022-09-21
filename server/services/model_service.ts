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

import { ILegacyClusterClient, ScopeableRequest } from '../../../../src/core/server';
import { getQueryFromSize, RequestPagination, getPagination } from './utils/pagination';
import { convertModelSource, generateModelSearchQuery } from './utils/model';
import { RecordNotFoundError } from './errors';

const modelSortFieldMapping: { [key: string]: string } = { trainTime: 'model_train_time' };

export class ModelService {
  private osClient: ILegacyClusterClient;

  constructor(osClient: ILegacyClusterClient) {
    this.osClient = osClient;
  }

  public async search({
    request,
    pagination,
    sort,
    ...restParams
  }: {
    request: ScopeableRequest;
    algorithms?: string[];
    ids?: string[];
    pagination: RequestPagination;
    context?: Record<string, Array<string | number>>;
    trainedStart?: number;
    trainedEnd?: number;
    sort?: Array<'trainTime-desc' | 'trainTime-asc'>;
  }) {
    const { hits } = await this.osClient
      .asScoped(request)
      .callAsCurrentUser('mlCommonsModel.search', {
        body: {
          query: generateModelSearchQuery(restParams),
          ...getQueryFromSize(pagination),
          ...(sort
            ? {
                sort: sort.map((sorting) => {
                  const [field, direction] = sorting.split('-');
                  return {
                    [modelSortFieldMapping[field] || field]: direction,
                  };
                }),
              }
            : {}),
        },
      });
    return {
      data: hits.hits.map(({ _id, _source }) => ({
        id: _id,
        ...convertModelSource(_source),
      })),
      pagination: getPagination(pagination.currentPage, pagination.pageSize, hits.total.value),
    };
  }

  public async getOne({ request, modelId }: { request: ScopeableRequest; modelId: string }) {
    const modelSource = await this.osClient
      .asScoped(request)
      .callAsCurrentUser('mlCommonsModel.getOne', {
        modelId,
      });
    return {
      id: modelId,
      ...convertModelSource(modelSource),
    };
  }

  public async delete({ request, modelId }: { request: ScopeableRequest; modelId: string }) {
    const { result } = await this.osClient
      .asScoped(request)
      .callAsCurrentUser('mlCommonsModel.delete', {
        modelId,
      });
    if (result === 'not_found') {
      throw new RecordNotFoundError();
    }
    return true;
  }
}
