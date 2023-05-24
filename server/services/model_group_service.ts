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

import {
  MODEL_GROUP_BASE_API,
  MODEL_GROUP_REGISTER_API,
  MODEL_GROUP_SEARCH_API,
  MODEL_GROUP_UPDATE_API,
} from './utils/constants';
import { generateMustQueries, generateTermQuery } from './utils/query';

type Status = 'success';

export class ModelGroupService {
  public static async register(params: {
    client: IScopedClusterClient;
    name: string;
    description?: string;
  }) {
    const { client, name, description } = params;
    const result = (
      await client.asCurrentUser.transport.request({
        method: 'POST',
        path: MODEL_GROUP_REGISTER_API,
        body: {
          name,
          description,
        },
      })
    ).body as {
      model_group_id: string;
      status: Status;
    };
    return result;
  }

  public static async update({
    client,
    id,
    name,
    description,
  }: {
    client: IScopedClusterClient;
    id: string;
    name?: string;
    description?: string;
  }) {
    const result = (
      await client.asCurrentUser.transport.request({
        method: 'PUT',
        path: MODEL_GROUP_UPDATE_API.replace('<model_group_id>', id),
        body: {
          name,
          description,
        },
      })
    ).body as {
      status: Status;
    };
    return result;
  }

  public static async delete({ client, id }: { client: IScopedClusterClient; id: string }) {
    const result = (
      await client.asCurrentUser.transport.request({
        method: 'DELETE',
        path: `${MODEL_GROUP_BASE_API}/${id}`,
      })
    ).body as {
      status: Status;
    };
    return result;
  }

  public static async search({
    client,
    id,
    name,
    from,
    size,
  }: {
    client: IScopedClusterClient;
    id?: string;
    name?: string;
    from: number;
    size: number;
  }) {
    const {
      body: { hits },
    } = await client.asCurrentUser.transport.request({
      method: 'GET',
      path: MODEL_GROUP_SEARCH_API,
      body: {
        query: generateMustQueries([
          ...(id ? [generateTermQuery('_id', id)] : []),
          ...(name ? [generateTermQuery('name', name)] : []),
        ]),
        from,
        size,
      },
    });

    return {
      data: hits.hits.map(({ _id, _source }) => ({
        id: _id,
        ..._source,
      })),
      total_model_groups: hits.total.value,
    };
  }
}
