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

import { IScopedClusterClient } from '../../../../src/core/server';
import { MODEL_STATE, ModelSearchSort } from '../../common';

import { getQueryFromSize, RequestPagination, getPagination } from './utils/pagination';
import { generateModelSearchQuery } from './utils/model';
import { MODEL_BASE_API } from './utils/constants';

const modelSortFieldMapping: { [key: string]: string } = {
  name: 'name.keyword',
};

export class ModelService {
  public static async search({
    pagination,
    sort,
    client,
    ...restParams
  }: {
    client: IScopedClusterClient;
    pagination: RequestPagination;
    sort?: ModelSearchSort[];
    states?: MODEL_STATE[];
    nameOrId?: string;
  }) {
    const {
      body: { hits },
    } = await client.asCurrentUser.transport.request({
      method: 'POST',
      path: `${MODEL_BASE_API}/_search`,
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
        ..._source,
      })),
      pagination: getPagination(pagination.currentPage, pagination.pageSize, hits.total.value),
    };
  }
}
