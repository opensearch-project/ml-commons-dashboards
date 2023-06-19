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
  model_id: string;
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
  total_model_versions: number;
}

export interface ModelVersionLoadResponse {
  task_id: string;
  status: string;
}

export interface ModelVersionUnloadResponse {
  [nodeId: string]: {
    stats: {
      [id: string]: string;
    };
  };
}

export interface ModelVersionProfileResponse {
  nodes: {
    [nodeId: string]: {
      models: {
        [id: string]: {
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
  modelId: string;
}

export interface UploadModelByURL extends UploadModelBase {
  url: string;
  modelConfig: Record<string, unknown>;
}

export interface UploadModelByChunk extends UploadModelBase {
  modelContentHashValue: string;
  totalChunks: number;
  modelConfig: Record<string, unknown>;
}

export class ModelVersion {
  public search({
    extraQuery,
    dataSourceId,
    ...restQuery
  }: {
    algorithms?: string[];
    ids?: string[];
    sort?: string[];
    name?: string;
    from: number;
    size: number;
    states?: MODEL_VERSION_STATE[];
    nameOrId?: string;
    versionOrKeyword?: string;
    modelIds?: string[];
    extraQuery?: Record<string, any>;
    dataSourceId?: string;
  }) {
    return InnerHttpProvider.getHttp().get<ModelVersionSearchResponse>(MODEL_VERSION_API_ENDPOINT, {
      query: extraQuery
        ? { ...restQuery, extra_query: JSON.stringify(extraQuery), data_source_id: dataSourceId }
        : { ...restQuery, data_source_id: dataSourceId },
    });
  }

  public delete(id: string) {
    return InnerHttpProvider.getHttp().delete(`${MODEL_VERSION_API_ENDPOINT}/${id}`);
  }

  public getOne(id: string) {
    return InnerHttpProvider.getHttp().get<ModelVersionDetail>(
      `${MODEL_VERSION_API_ENDPOINT}/${id}`
    );
  }

  public load(id: string) {
    return InnerHttpProvider.getHttp().post<ModelVersionLoadResponse>(
      `${MODEL_VERSION_LOAD_API_ENDPOINT}/${id}`
    );
  }

  public unload(id: string) {
    return InnerHttpProvider.getHttp().post<ModelVersionUnloadResponse>(
      `${MODEL_VERSION_UNLOAD_API_ENDPOINT}/${id}`
    );
  }

  public profile(id: string) {
    return InnerHttpProvider.getHttp().get<ModelVersionProfileResponse>(
      `${MODEL_VERSION_PROFILE_API_ENDPOINT}/${id}`
    );
  }

  public upload<T extends UploadModelBase>(
    model: T
  ): Promise<T extends UploadModelByChunk ? { model_version_id: string } : { task_id: string }> {
    return InnerHttpProvider.getHttp().post(MODEL_VERSION_UPLOAD_API_ENDPOINT, {
      body: JSON.stringify(model),
    });
  }

  public uploadChunk(id: string, chunkId: string, chunkContent: Blob) {
    return InnerHttpProvider.getHttp().post(
      `${MODEL_VERSION_API_ENDPOINT}/${id}/chunk/${chunkId}`,
      {
        body: chunkContent,
        headers: {
          'Content-Type': 'application/octet-stream',
        },
      }
    );
  }
}
