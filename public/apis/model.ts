/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { MODEL_API_ENDPOINT } from '../../server/routes/constants';
import { MODEL_STATE, ModelSearchSort } from '../../common';
import { Pagination } from '../../server/services/utils/pagination';
import { InnerHttpProvider } from './inner_http_provider';

export interface ModelSearchItem {
  id: string;
  name: string;
  algorithm: string;
  state: string;
  version: string;
  current_worker_node_count: number;
  planning_worker_node_count: number;
}

export interface ModelDetail extends ModelSearchItem {
  content: string;
}

export interface ModelSearchResponse {
  data: ModelSearchItem[];
  pagination: Pagination;
}

export class Model {
  public search(query: {
    sort?: ModelSearchSort[];
    currentPage: number;
    pageSize: number;
    states?: MODEL_STATE[];
    nameOrId?: string;
  }) {
    return InnerHttpProvider.getHttp().get<ModelSearchResponse>(MODEL_API_ENDPOINT, {
      query,
    });
  }
}
