/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { MODEL_VERSION_STATE, ModelAggregateItem, ModelAggregateSort } from '../../common';
import { MODEL_AGGREGATE_API_ENDPOINT } from '../../server/routes/constants';

import { InnerHttpProvider } from './inner_http_provider';

interface ModelAggregateSearchResponse {
  data: ModelAggregateItem[];
  total_models: number;
}

export class ModelAggregate {
  public search(query: {
    from: number;
    size: number;
    sort?: ModelAggregateSort;
    states?: MODEL_VERSION_STATE[];
    queryString?: string;
  }) {
    return InnerHttpProvider.getHttp().get<ModelAggregateSearchResponse>(
      MODEL_AGGREGATE_API_ENDPOINT,
      {
        query,
      }
    );
  }
}
