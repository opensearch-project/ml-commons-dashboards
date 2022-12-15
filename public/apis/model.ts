/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  MODEL_API_ENDPOINT,
  MODEL_LOAD_API_ENDPOINT,
  MODEL_UNLOAD_API_ENDPOINT,
  MODEL_UPLOAD_API_ENDPOINT,
  MODEL_PROFILE_API_ENDPOINT,
} from '../../server/routes/constants';
import { Pagination } from '../../server/services/utils/pagination';
import { InnerHttpProvider } from './inner_http_provider';

export interface ModelSearchItem {
  id: string;
  name: string;
  algorithm: string;
  context: string;
  trainTime: number;
  state: string;
  version: string;
}

export interface ModelDetail extends ModelSearchItem {
  content: string;
}

export interface ModelSarchResponse {
  data: ModelSearchItem[];
  pagination: Pagination;
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
  version: string;
  description: string;
  modelFormat: string;
  modelConfig: {
    modelType: string;
    embeddingDimension: number;
    frameworkType: string;
  };
}

export interface UploadModelByURL extends UploadModelBase {
  url: string;
}

export interface UploadModelByChunk extends UploadModelBase {
  modelTaskType: string;
  modelContentHashValue: string;
  totalChunks: number;
}

export class Model {
  public search(query: {
    algorithms?: string[];
    ids?: string[];
    context?: { [key: string]: Array<string | number> };
    trainedStart?: number;
    trainedEnd?: number;
    sort?: Array<'trainTime-desc' | 'trainTime-asc' | 'version-desc' | 'version-asc'>;
    name?: string;
    currentPage: number;
    pageSize: number;
  }) {
    return InnerHttpProvider.getHttp().get<ModelSarchResponse>(MODEL_API_ENDPOINT, {
      query: {
        ...query,
        context: JSON.stringify(query.context),
      },
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
      ? { taskId: string }
      : T extends UploadModelByChunk
      ? { modelId: string }
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
