/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { OpenSearchModel } from '../../common';
import { MODEL_API_ENDPOINT } from '../../server/routes/constants';
import { InnerHttpProvider } from './inner_http_provider';

export interface ModelSearchResponse {
  data: OpenSearchModel[];
  total_models: number;
}

export class Model {
  public register(body: {
    name: string;
    description?: string;
    modelAccessMode: 'public' | 'restricted' | 'private';
    backendRoles?: string[];
    addAllBackendRoles?: boolean;
  }) {
    return InnerHttpProvider.getHttp().post<{ model_id: string; status: string }>(
      MODEL_API_ENDPOINT,
      {
        body: JSON.stringify(body),
      }
    );
  }

  public update({ id, name, description }: { id: string; name?: string; description?: string }) {
    return InnerHttpProvider.getHttp().put<{ status: 'success' }>(`${MODEL_API_ENDPOINT}/${id}`, {
      body: JSON.stringify({
        name,
        description,
      }),
    });
  }

  public delete(id: string) {
    return InnerHttpProvider.getHttp().delete<{ status: 'success' }>(`${MODEL_API_ENDPOINT}/${id}`);
  }

  public search(query: {
    ids?: string[];
    name?: string;
    from: number;
    size: number;
    extraQuery?: string;
  }) {
    return InnerHttpProvider.getHttp().get<ModelSearchResponse>(MODEL_API_ENDPOINT, {
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
