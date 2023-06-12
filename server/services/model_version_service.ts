/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

/*
 *   Copyright OpenSearch Contributors
 *
 *   Licensed under the Apache License, Version 2.0 (the "License").
 *   You may not use this file except in compliance with the License.
 *   A copy of the License is located at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 *   or in the "license" file accompanying this file. This file is distributed
 *   on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 *   express or implied. See the License for the specific language governing
 *   permissions and limitations under the License.
 */

import { IScopedClusterClient } from '../../../../src/core/server';
import { MODEL_VERSION_STATE } from '../../common';

import { generateModelSearchQuery } from './utils/model';
import { RecordNotFoundError } from './errors';
import {
  MODEL_BASE_API,
  MODEL_META_API,
  MODEL_PROFILE_API,
  MODEL_UPLOAD_API,
} from './utils/constants';

const modelSortFieldMapping: { [key: string]: string } = {
  version: 'model_version',
  name: 'name.keyword',
  id: '_id',
};

interface UploadModelBase {
  name: string;
  version?: string;
  description?: string;
  modelFormat: string;
  modelConfig: Record<string, unknown>;
  modelId: string;
}

interface UploadModelByURL extends UploadModelBase {
  url: string;
}

interface UploadModelByChunk extends UploadModelBase {
  modelContentHashValue: string;
  totalChunks: number;
}

type UploadResultInner<
  T extends UploadModelByURL | UploadModelByChunk
> = T extends UploadModelByChunk
  ? { model_version_id: string; status: string }
  : T extends UploadModelByURL
  ? { task_id: string; status: string }
  : never;

type UploadResult<T extends UploadModelByURL | UploadModelByChunk> = Promise<UploadResultInner<T>>;

const isUploadModelByURL = (
  test: UploadModelByURL | UploadModelByChunk
): test is UploadModelByURL => (test as UploadModelByURL).url !== undefined;

export class ModelVersionService {
  constructor() {}

  public static async search({
    from,
    size,
    sort,
    client,
    ...restParams
  }: {
    client: IScopedClusterClient;
    algorithms?: string[];
    ids?: string[];
    from: number;
    size: number;
    sort?: string[];
    name?: string;
    states?: MODEL_VERSION_STATE[];
    nameOrId?: string;
    versionOrKeyword?: string;
    modelIds?: string[];
  }) {
    const {
      body: { hits },
    } = await client.asCurrentUser.transport.request({
      method: 'POST',
      path: `${MODEL_BASE_API}/_search`,
      body: {
        query: generateModelSearchQuery(restParams),
        from,
        size,
        ...(sort
          ? {
              sort: sort.map((sorting) => {
                const [field, direction] = sorting.split('-');
                return {
                  [modelSortFieldMapping[field] || field]: direction,
                };
              }),
            }
          : {}),
      },
    });

    return {
      data: hits.hits.map(({ _id, _source: source }) => ({
        id: _id,
        model_id: source.model_group_id,
        ...source,
      })),
      total_model_versions: hits.total.value,
    };
  }

  public static async getOne({ id, client }: { id: string; client: IScopedClusterClient }) {
    const modelSource = (
      await client.asCurrentUser.transport.request({
        method: 'GET',
        path: `${MODEL_BASE_API}/${id}`,
      })
    ).body;
    return {
      id,
      model_id: modelSource.model_group_id,
      ...modelSource,
      model_id: modelSource.model_group_id,
    };
  }

  public static async delete({ id, client }: { id: string; client: IScopedClusterClient }) {
    const { result } = (
      await client.asCurrentUser.transport.request({
        method: 'DELETE',
        path: `${MODEL_BASE_API}/${id}`,
      })
    ).body;
    if (result === 'not_found') {
      throw new RecordNotFoundError();
    }
    return true;
  }

  public static async load({ id, client }: { id: string; client: IScopedClusterClient }) {
    return (
      await client.asCurrentUser.transport.request({
        method: 'POST',
        path: `${MODEL_BASE_API}/${id}/_load`,
      })
    ).body;
  }

  public static async unload({ id, client }: { id: string; client: IScopedClusterClient }) {
    return (
      await client.asCurrentUser.transport.request({
        method: 'POST',
        path: `${MODEL_BASE_API}/${id}/_unload`,
      })
    ).body;
  }

  public static async profile({ client, id }: { client: IScopedClusterClient; id: string }) {
    return (
      await client.asCurrentUser.transport.request({
        method: 'GET',
        path: `${MODEL_PROFILE_API}/${id}`,
      })
    ).body;
  }

  public static async upload<T extends UploadModelByChunk | UploadModelByURL>({
    client,
    model,
  }: {
    client: IScopedClusterClient;
    model: T;
  }): UploadResult<T> {
    const { name, version, description, modelFormat, modelConfig, modelId } = model;
    const uploadModelBase = {
      name,
      version,
      description,
      model_format: modelFormat,
      model_config: modelConfig,
      model_group_id: modelId,
    };
    if (isUploadModelByURL(model)) {
      const { task_id: taskId, status } = (
        await client.asCurrentUser.transport.request({
          method: 'POST',
          path: MODEL_UPLOAD_API,
          body: {
            ...uploadModelBase,
            url: model.url,
          },
        })
      ).body;
      return { task_id: taskId, status } as UploadResultInner<T>;
    }

    const { model_id: modelVersionId, status } = (
      await client.asCurrentUser.transport.request({
        method: 'POST',
        path: MODEL_META_API,
        body: {
          ...uploadModelBase,
          model_content_hash_value: model.modelContentHashValue,
          total_chunks: model.totalChunks,
        },
      })
    ).body;
    return { model_version_id: modelVersionId, status } as UploadResultInner<T>;
  }

  public static async uploadModelChunk({
    client,
    id,
    chunkId,
    chunk,
  }: {
    client: IScopedClusterClient;
    id: string;
    chunkId: string;
    chunk: Buffer;
  }) {
    return client.asCurrentUser.transport.request({
      method: 'POST',
      path: `${MODEL_BASE_API}/${id}/chunk/${chunkId}`,
      body: chunk,
    });
  }
}
