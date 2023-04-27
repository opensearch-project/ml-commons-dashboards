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

import { TASK_BASE_API } from './utils/constants';
import { generateTermQuery, generateMustQueries } from './utils/query';

export class TaskService {
  public static async getOne({ client, taskId }: { client: IScopedClusterClient; taskId: string }) {
    return (
      await client.asCurrentUser.transport.request({
        method: 'GET',
        path: `${TASK_BASE_API}/${taskId}`,
      })
    ).body;
  }

  public static async search({
    client,
    sort,
    from,
    size,
    modelId,
    taskType,
    state,
  }: {
    client: IScopedClusterClient;
    from: number;
    size: number;
    modelId?: string;
    taskType?: string;
    sort?: Array<'last_update_time-desc' | 'last_update_time-asc'>;
    state?: string;
  }) {
    const {
      body: { hits },
    } = await client.asCurrentUser.transport.request({
      method: 'POST',
      path: `${TASK_BASE_API}/_search`,
      body: {
        query: generateMustQueries([
          ...(modelId ? [generateTermQuery('model_id', modelId)] : []),
          ...(taskType ? [generateTermQuery('task_type', taskType)] : []),
          ...(state ? [generateTermQuery('state', state)] : []),
        ]),
        from,
        size,
        ...(sort
          ? {
              sort: sort.map((sorting) => {
                const [field, direction] = sorting.split('-');
                return {
                  [field]: direction,
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
      total_tasks: hits.total.value,
    };
  }
}
