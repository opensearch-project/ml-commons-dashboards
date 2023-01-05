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
import { MODEL_STATE, OpenSearchModelBase } from '../../common/model';

import { MODEL_SEARCH_API } from './utils/constants';
import { RequestPagination, getQueryFromSize, getPagination } from './utils/pagination';

const MAX_MODEL_BUCKET_NUM = 10000;

interface GetAggregateModelsParams {
  client: IScopedClusterClient;
  pagination: RequestPagination;
  name?: string;
  sort: 'created_time';
  order: 'desc' | 'asc';
}

export class ModelAggregateService {
  public static async getAggregateModels({
    client,
    pagination,
    sort,
    name,
    order,
  }: GetAggregateModelsParams) {
    const aggregateResult = await client.asCurrentUser.transport.request({
      method: 'GET',
      path: MODEL_SEARCH_API,
      body: {
        size: 0,
        query: {
          bool: {
            must: [...(name ? [{ match: { name } }] : [])],
            must_not: {
              exists: {
                field: 'chunk_number',
              },
            },
          },
        },
        aggs: {
          models: {
            terms: {
              field: 'name.keyword',
              size: MAX_MODEL_BUCKET_NUM,
            },
            aggs: {
              latest_version_hits: {
                top_hits: {
                  sort: [
                    {
                      created_time: {
                        order: 'desc',
                      },
                    },
                  ],
                  size: 1,
                  _source: ['model_version', 'model_state', 'description', 'created_time'],
                },
              },
            },
          },
        },
      },
    });
    const models = aggregateResult.body.aggregations.models.buckets as Array<{
      key: string;
      doc_count: number;
      latest_version_hits: {
        hits: {
          hits: [
            {
              _source: Pick<OpenSearchModelBase, 'model_version' | 'model_state'> & {
                created_time: number;
                description?: string;
              };
            }
          ];
        };
      };
    }>;
    const { from, size } = getQueryFromSize(pagination);

    return {
      models: models
        .sort(
          (a, b) =>
            ((a.latest_version_hits.hits.hits[0]._source.created_time ?? 0) -
              (b.latest_version_hits.hits.hits[0]._source.created_time ?? 0)) *
            (sort === 'created_time' && order === 'asc' ? 1 : -1)
        )
        .slice(from, from + size),
      pagination: getPagination(pagination.currentPage, pagination.pageSize, models.length),
    };
  }

  public static async search(params: GetAggregateModelsParams) {
    const { client } = params;
    const { models, pagination } = await ModelAggregateService.getAggregateModels(params);
    const { names, count } = models.reduce<{ names: string[]; count: number }>(
      (previous, { key, doc_count: docCount }: { key: string; doc_count: number }) => ({
        names: previous.names.concat(key),
        count: docCount + previous.count,
      }),
      { names: [], count: 0 }
    );
    const versionResult = await client.asCurrentUser.transport.request({
      method: 'GET',
      path: MODEL_SEARCH_API,
      body: {
        size: count,
        query: {
          bool: {
            should: names.map((name) => ({ term: { 'name.keyword': name } })),
            must_not: {
              exists: {
                field: 'chunk_number',
              },
            },
          },
        },
        _source: ['name', 'model_version', 'model_state', 'model_id'],
      },
    });
    const versionResultMap = (versionResult.body.hits.hits as Array<{
      _id: string;
      _source: OpenSearchModelBase;
    }>).reduce<{
      [key: string]: Array<Omit<OpenSearchModelBase, 'name'>>;
    }>(
      (pValue, { _source: { name, ...resetProperties } }) => ({
        ...pValue,
        [name]: (pValue[name] ?? []).concat(resetProperties),
      }),
      {}
    );
    return {
      data: models.map(
        ({
          key,
          latest_version_hits: {
            hits: { hits },
          },
        }) => {
          const latestVersion = hits[0]._source;
          return {
            name: key,
            deployed_versions: (versionResultMap[key] ?? [])
              .filter((item) => item.model_state === MODEL_STATE.loaded)
              .map((item) => item.model_version),
            // TODO: Change to the real model owner
            owner: key,
            latest_version: latestVersion.model_version,
            latest_version_state: latestVersion.model_state,
            created_time: latestVersion.created_time,
          };
        }
      ),
      pagination,
    };
  }
}
