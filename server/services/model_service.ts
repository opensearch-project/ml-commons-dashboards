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

import { OpenSearchClient } from '../../../../src/core/server';
import { MODEL_STATE, ModelSearchSort } from '../../common';

import { generateModelSearchQuery } from './utils/model';
import { MODEL_BASE_API } from './utils/constants';

const modelSortFieldMapping: { [key: string]: string } = {
  name: 'name.keyword',
  id: '_id',
};

export class ModelService {
  public static async search({
    from,
    size,
    sort,
    transport,
    ...restParams
  }: {
    transport: OpenSearchClient['transport'];
    from: number;
    size: number;
    sort?: ModelSearchSort[];
    states?: MODEL_STATE[];
    extraQuery?: Record<string, any>;
    nameOrId?: string;
  }) {
    const {
      body: { hits },
    } = await transport.request({
      method: 'POST',
      path: `${MODEL_BASE_API}/_search`,
      body: {
        query: generateModelSearchQuery(restParams),
        from,
        size,
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
      total_models: hits.total.value,
    };
  }
}
