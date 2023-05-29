/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { MODEL_STATE } from '../../common';
import {
  MODEL_API_ENDPOINT,
  MODEL_LOAD_API_ENDPOINT,
  MODEL_UNLOAD_API_ENDPOINT,
  MODEL_UPLOAD_API_ENDPOINT,
  MODEL_PROFILE_API_ENDPOINT,
} from '../../server/routes/constants';
import { InnerHttpProvider } from './inner_http_provider';

export interface ModelSearchItem {
  id: string;
  name: string;
  // TODO: the new version details API may not have this field, because model description is on model group level
  // we should fix this when integrating the new API changes
  description: string;
  algorithm: string;
  model_state: MODEL_STATE;
  model_version: string;
  current_worker_node_count: number;
  planning_worker_node_count: number;
  planning_worker_nodes: string[];
  model_config?: {
    all_config?: string;
    embedding_dimension: number;
    framework_type: string;
    model_type: string;
  };
  last_updated_time: number;
  created_time: number;
  last_registered_time?: number;
  last_deployed_time?: number;
  last_undeployed_time?: number;
}

export interface ModelDetail extends ModelSearchItem {
  content: string;
  last_updated_time: number;
  created_time: number;
  model_format: string;
}

export interface ModelSearchResponse {
  data: ModelSearchItem[];
  total_models: number;
}

export interface ModelLoadResponse {
  task_id: string;
  status: string;
}

export interface ModelUnloadResponse {
  [nodeId: string]: {
    stats: {
      [modelId: string]: string;
    };
  };
}

export interface ModelProfileResponse {
  nodes: {
    [nodeId: string]: {
      models: {
        [modelId: string]: {
          model_state: string;
          predictor: string;
          worker_nodes: string[];
        };
      };
    };
  };
}

interface UploadModelBase {
  name: string;
  version?: string;
  description?: string;
  modelFormat: string;
  modelConfig: Record<string, unknown>;
  modelGroupId: string;
}

export interface UploadModelByURL extends UploadModelBase {
  url: string;
}

export interface UploadModelByChunk extends UploadModelBase {
  modelContentHashValue: string;
  totalChunks: number;
}

export class Model {
  public search(query: {
    algorithms?: string[];
    ids?: string[];
    sort?: string[];
    name?: string;
    from: number;
    size: number;
    states?: MODEL_STATE[];
    nameOrId?: string;
    versionOrKeyword?: string;
    modelGroupIds?: string[];
  }) {
    return InnerHttpProvider.getHttp().get<ModelSearchResponse>(MODEL_API_ENDPOINT, {
      query,
    });
  }

  public delete(modelId: string) {
    return InnerHttpProvider.getHttp().delete(`${MODEL_API_ENDPOINT}/${modelId}`);
  }

  public getOne(modelId: string) {
    return InnerHttpProvider.getHttp().get<ModelDetail>(`${MODEL_API_ENDPOINT}/${modelId}`);
  }

  public load(modelId: string) {
    return InnerHttpProvider.getHttp().post<ModelLoadResponse>(
      `${MODEL_LOAD_API_ENDPOINT}/${modelId}`
    );
  }

  public unload(modelId: string) {
    return InnerHttpProvider.getHttp().post<ModelUnloadResponse>(
      `${MODEL_UNLOAD_API_ENDPOINT}/${modelId}`
    );
  }

  public profile(modelId: string) {
    return InnerHttpProvider.getHttp().get<ModelProfileResponse>(
      `${MODEL_PROFILE_API_ENDPOINT}/${modelId}`
    );
  }

  public upload<T extends UploadModelByURL | UploadModelByChunk>(
    model: T
  ): Promise<
    T extends UploadModelByURL
      ? { task_id: string }
      : T extends UploadModelByChunk
      ? { model_id: string }
      : never
  > {
    return InnerHttpProvider.getHttp().post(MODEL_UPLOAD_API_ENDPOINT, {
      body: JSON.stringify(model),
    });
  }

  public uploadChunk(modelId: string, chunkId: string, chunkContent: Blob) {
    return InnerHttpProvider.getHttp().post(`${MODEL_API_ENDPOINT}/${modelId}/chunk/${chunkId}`, {
      body: chunkContent,
      headers: {
        'Content-Type': 'application/octet-stream',
      },
    });
  }
}
