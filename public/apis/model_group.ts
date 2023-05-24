/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { MODEL_GROUP_API_ENDPOINT } from '../../server/routes/constants';
import { InnerHttpProvider } from './inner_http_provider';

interface ModelGroupSearchItem {
  owner: {
    backend_roles: string[];
    roles: string[];
    name: string;
  };
  latest_version: number;
  last_updated_time: number;
  name: string;
  description?: string;
}

export interface ModelGroupSearchResponse {
  data: ModelGroupSearchItem[];
  total_model_groups: number;
}

export class ModelGroup {
  public register(body: { name: string; description?: string }) {
    return InnerHttpProvider.getHttp().post<{ model_group_id: string; status: 'success' }>(
      MODEL_GROUP_API_ENDPOINT,
      {
        body: JSON.stringify(body),
      }
    );
  }

  public update({ id, name, description }: { id: string; name?: string; description?: string }) {
    return InnerHttpProvider.getHttp().put<{ status: 'success' }>(
      `${MODEL_GROUP_API_ENDPOINT}/${id}`,
      {
        body: JSON.stringify({
          name,
          description,
        }),
      }
    );
  }

  public delete(id: string) {
    return InnerHttpProvider.getHttp().delete<{ status: 'success' }>(
      `${MODEL_GROUP_API_ENDPOINT}/${id}`
    );
  }

  public search(query: { id?: string; name?: string; from: number; size: number }) {
    return InnerHttpProvider.getHttp().get<ModelGroupSearchResponse>(MODEL_GROUP_API_ENDPOINT, {
      query,
    });
  }
}
