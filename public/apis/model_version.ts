/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { MODEL_VERSION_STATE } from '../../common';
import {
  MODEL_VERSION_API_ENDPOINT,
  MODEL_VERSION_LOAD_API_ENDPOINT,
  MODEL_VERSION_UNLOAD_API_ENDPOINT,
  MODEL_VERSION_UPLOAD_API_ENDPOINT,
  MODEL_VERSION_PROFILE_API_ENDPOINT,
} from '../../server/routes/constants';
import { InnerHttpProvider } from './inner_http_provider';

export interface ModelVersionSearchItem {
  id: string;
  name: string;
  // TODO: the new version details API may not have this field, because model description is on model group level
  // we should fix this when integrating the new API changes
  description: string;
  algorithm: string;
  model_state: MODEL_VERSION_STATE;
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

export interface ModelVersionDetail extends ModelVersionSearchItem {
  content: string;
  last_updated_time: number;
  created_time: number;
  model_format: string;
}

export interface ModelVersionSearchResponse {
  data: ModelVersionSearchItem[];
  total_models: number;
}

export interface ModelVersionLoadResponse {
  task_id: string;
  status: string;
}

export interface ModelVersionUnloadResponse {
  [nodeId: string]: {
    stats: {
      [modelId: string]: string;
    };
  };
}

export interface ModelVersionProfileResponse {
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

export class ModelVersion {
  public search(query: {
    algorithms?: string[];
    ids?: string[];
    sort?: string[];
    name?: string;
    from: number;
    size: number;
    states?: MODEL_VERSION_STATE[];
    nameOrId?: string;
    versionOrKeyword?: string;
    modelGroupIds?: string[];
  }) {
    return InnerHttpProvider.getHttp().get<ModelVersionSearchResponse>(MODEL_VERSION_API_ENDPOINT, {
      query,
    });
  }

  public delete(modelId: string) {
    return InnerHttpProvider.getHttp().delete(`${MODEL_VERSION_API_ENDPOINT}/${modelId}`);
  }

  public getOne(modelId: string) {
    return InnerHttpProvider.getHttp().get<ModelVersionDetail>(
      `${MODEL_VERSION_API_ENDPOINT}/${modelId}`
    );
  }

  public load(modelId: string) {
    return InnerHttpProvider.getHttp().post<ModelVersionLoadResponse>(
      `${MODEL_VERSION_LOAD_API_ENDPOINT}/${modelId}`
    );
  }

  public unload(modelId: string) {
    return InnerHttpProvider.getHttp().post<ModelVersionUnloadResponse>(
      `${MODEL_VERSION_UNLOAD_API_ENDPOINT}/${modelId}`
    );
  }

  public profile(modelId: string) {
    return InnerHttpProvider.getHttp().get<ModelVersionProfileResponse>(
      `${MODEL_VERSION_PROFILE_API_ENDPOINT}/${modelId}`
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
    return InnerHttpProvider.getHttp().post(MODEL_VERSION_UPLOAD_API_ENDPOINT, {
      body: JSON.stringify(model),
    });
  }

  public uploadChunk(modelId: string, chunkId: string, chunkContent: Blob) {
    return InnerHttpProvider.getHttp().post(
      `${MODEL_VERSION_API_ENDPOINT}/${modelId}/chunk/${chunkId}`,
      {
        body: chunkContent,
        headers: {
          'Content-Type': 'application/octet-stream',
        },
      }
    );
  }
}
