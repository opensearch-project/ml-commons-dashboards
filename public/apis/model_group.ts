/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { OpenSearchModelGroup } from '../../common';
import { MODEL_GROUP_API_ENDPOINT } from '../../server/routes/constants';
import { InnerHttpProvider } from './inner_http_provider';

export interface ModelGroupSearchResponse {
  data: OpenSearchModelGroup[];
  total_model_groups: number;
}

export class ModelGroup {
  public register(body: {
    name: string;
    description?: string;
    modelAccessMode: 'public' | 'restricted' | 'private';
    backendRoles?: string[];
    addAllBackendRoles?: boolean;
  }) {
    return InnerHttpProvider.getHttp().post<{ model_group_id: string; status: 'CREATED' }>(
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

  public search(query: {
    ids?: string[];
    name?: string;
    from: number;
    size: number;
    queryString?: string;
  }) {
    return InnerHttpProvider.getHttp().get<ModelGroupSearchResponse>(MODEL_GROUP_API_ENDPOINT, {
      query,
    });
  }

  public getOne = async (id: string) => {
    return (
      await this.search({
        ids: [id],
        from: 0,
        size: 1,
      })
    ).data[0];
  };
}
