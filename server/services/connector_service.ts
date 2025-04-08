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
import { ModelService } from './model_service';

import { CONNECTOR_SEARCH_API, MODEL_SEARCH_API } from './utils/constants';

export class ConnectorService {
  public static async search({
    from,
    size,
    transport,
  }: {
    transport: OpenSearchClient['transport'];
    from: number;
    size: number;
  }) {
    let result;
    try {
      result = await transport.request({
        method: 'POST',
        path: CONNECTOR_SEARCH_API,
        body: {
          query: {
            match_all: {},
          },
          from,
          size,
        },
      });
    } catch (e) {
      if (e instanceof Error && e.message.includes('index_not_found_exception')) {
        return {
          data: [],
          total_connectors: 0,
        };
      }
      throw e;
    }
    return {
      data: result.body.hits.hits.map(({ _id, _source }) => ({
        id: _id,
        ..._source,
      })),
      total_connectors: result.body.hits.total.value,
    };
  }

  public static async getUniqueInternalConnectorNames({
    transport,
    size,
  }: {
    transport: OpenSearchClient['transport'];
    size: number;
  }) {
    let result;
    try {
      result = await ModelService.search({
        from: 0,
        size: 10000,
        transport,
        extraQuery: {
          bool: {
            must: [
              {
                exists: {
                  field: 'connector.name',
                },
              },
            ],
          },
        },
      });
    } catch (e) {
      if (e instanceof Error && e.message.includes('index_not_found_exception')) {
        return [];
      }
      throw e;
    }
    if (!result.data) {
      return [];
    }
    return Array.from(
      new Set(
        result.data
          .map((item: { connector?: { name: string } }) => item?.connector?.name)
          .filter((connectorName: string | undefined) => !!connectorName)
      )
    );
  }
}
