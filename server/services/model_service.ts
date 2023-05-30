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

import { ModelSort, OpenSearchModel } from '../../common';
import { IScopedClusterClient } from '../../../../src/core/server';

import {
  MODEL_GROUP_BASE_API,
  MODEL_GROUP_REGISTER_API,
  MODEL_GROUP_SEARCH_API,
  MODEL_GROUP_UPDATE_API,
} from './utils/constants';
import { generateTermQuery } from './utils/query';

const getSortItem = (sort: ModelSort) => {
  const [key, direction] = sort.split('-');
  const keyMapping: { [key: string]: string } = {
    'owner.name': 'owner.name.keyword',
    name: 'name.keyword',
  };

  return { [keyMapping[key] || key]: direction };
};

export class ModelService {
  public static async register(params: {
    client: IScopedClusterClient;
    name: string;
    description?: string;
    modelAccessMode: 'public' | 'restricted' | 'private';
    backendRoles?: string[];
    addAllBackendRoles?: boolean;
  }) {
    const { client, name, description, modelAccessMode, backendRoles, addAllBackendRoles } = params;
    const result = (
      await client.asCurrentUser.transport.request({
        method: 'POST',
        path: MODEL_GROUP_REGISTER_API,
        body: {
          name,
          description,
          model_access_mode: modelAccessMode,
          backend_roles: backendRoles,
          add_all_backend_roles: addAllBackendRoles,
        },
      })
    ).body as {
      model_group_id: string;
      status: 'CREATED';
    };
    return {
      model_id: result.model_group_id,
      status: result.status,
    };
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
      status: 'UPDATED';
    };
    return result;
  }

  public static async delete({ client, id }: { client: IScopedClusterClient; id: string }) {
    const result = (
      await client.asCurrentUser.transport.request({
        method: 'DELETE',
        path: `${MODEL_GROUP_BASE_API}/${id}`,
      })
    ).body;
    return result;
  }

  public static async search({
    client,
    ids,
    name,
    from,
    size,
    sort,
    extraQuery,
  }: {
    client: IScopedClusterClient;
    ids?: string[];
    name?: string;
    from: number;
    size: number;
    sort?: ModelSort;
    extraQuery?: Record<string, any>;
  }) {
    const {
      body: { hits },
    } = await client.asCurrentUser.transport.request({
      method: 'POST',
      path: MODEL_GROUP_SEARCH_API,
      body: {
        query: {
          bool: {
            must: [
              ...(ids ? [generateTermQuery('_id', ids)] : []),
              ...(name ? [generateTermQuery('name', name)] : []),
              ...(extraQuery ? [extraQuery] : []),
            ],
          },
        },
        from,
        size,
        ...(sort
          ? {
              sort: [getSortItem(sort)],
            }
          : {}),
      },
    });

    return {
      data: hits.hits.map(({ _id, _source }) => ({
        id: _id,
        ..._source,
      })) as OpenSearchModel[],
      total_models: hits.total.value,
    };
  }
}
