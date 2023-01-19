/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { MODEL_AGGREGATE_API_ENDPOINT } from '../../server/routes/constants';
import { InnerHttpProvider } from './inner_http_provider';
import { Pagination } from '../../server/services/utils/pagination';
import { MODEL_STATE } from '../../common/model';

export interface ModelAggregateSearchItem {
  name: string;
  description?: string;
  latest_version: string;
  latest_version_state: MODEL_STATE;
  deployed_versions: string[];
  owner: string;
  created_time?: number;
}

interface ModelAggregateSearchResponse {
  data: ModelAggregateSearchItem[];
  pagination: Pagination;
}

export class ModelAggregate {
  public search(query: {
    pageSize: number;
    currentPage: number;
    sort: 'created_time';
    order: 'desc' | 'asc';
    name?: string;
  }) {
    return InnerHttpProvider.getHttp().get<ModelAggregateSearchResponse>(
      MODEL_AGGREGATE_API_ENDPOINT,
      {
        query,
      }
    );
  }
}
