/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { schema } from '@osd/config-schema';
import { MAX_MODEL_CHUNK_SIZE, MODEL_VERSION_STATE } from '../../common';
import { IRouter, opensearchDashboardsResponseFactory } from '../../../../src/core/server';
import { ModelVersionService, RecordNotFoundError } from '../services';
import {
  MODEL_VERSION_API_ENDPOINT,
  MODEL_VERSION_LOAD_API_ENDPOINT,
  MODEL_VERSION_UNLOAD_API_ENDPOINT,
  MODEL_VERSION_UPLOAD_API_ENDPOINT,
  MODEL_VERSION_PROFILE_API_ENDPOINT,
} from './constants';

const validateSortItem = (sort: string) => {
  const [key, direction] = sort.split('-');
  if (key === undefined || direction === undefined) {
    return 'Invalidate sort';
  }
  if (direction !== 'asc' && direction !== 'desc') {
    return 'Invalidate sort';
  }
  const availableSortKeys = ['id', 'version', 'last_updated_time', 'name', 'model_state'];

  if (!availableSortKeys.includes(key) && !key.startsWith('tags.')) {
    return 'Invalidate sort';
  }
  return undefined;
};

const validateUniqueSort = (sort: string[]) => {
  const uniqueSortKeys = new Set(sort.map((item) => item.split('-')[0]));
  if (uniqueSortKeys.size < sort.length) {
    return 'Invalidate sort';
  }
  return undefined;
};

export const modelStateSchema = schema.oneOf([
  schema.literal(MODEL_VERSION_STATE.deployed),
  schema.literal(MODEL_VERSION_STATE.trained),
  schema.literal(MODEL_VERSION_STATE.undeployed),
  schema.literal(MODEL_VERSION_STATE.registered),
  schema.literal(MODEL_VERSION_STATE.registering),
  schema.literal(MODEL_VERSION_STATE.deploying),
  schema.literal(MODEL_VERSION_STATE.partiallyDeployed),
  schema.literal(MODEL_VERSION_STATE.deployFailed),
  schema.literal(MODEL_VERSION_STATE.registerFailed),
]);

const modelUploadBaseSchema = schema.object({
  name: schema.string(),
  version: schema.maybe(schema.string()),
  description: schema.maybe(schema.string()),
  modelFormat: schema.string(),
  modelId: schema.string(),
});

const modelUploadByURLSchema = modelUploadBaseSchema.extends({
  url: schema.string(),
  modelConfig: schema.object({}, { unknowns: 'allow' }),
});

const modelUploadByChunkSchema = modelUploadBaseSchema.extends({
  modelContentHashValue: schema.string(),
  totalChunks: schema.number(),
  modelConfig: schema.object({}, { unknowns: 'allow' }),
});

export const modelVersionRouter = (router: IRouter) => {
  router.get(
    {
      path: MODEL_VERSION_API_ENDPOINT,
      validate: {
        query: schema.object({
          name: schema.maybe(schema.string()),
          algorithms: schema.maybe(
            schema.oneOf([schema.string(), schema.arrayOf(schema.string())])
          ),
          ids: schema.maybe(schema.oneOf([schema.string(), schema.arrayOf(schema.string())])),
          from: schema.number({ min: 0 }),
          size: schema.number({ max: 50 }),
          sort: schema.maybe(
            schema.oneOf([
              schema.string({ validate: validateSortItem }),
              schema.arrayOf(schema.string({ validate: validateSortItem }), {
                validate: validateUniqueSort,
              }),
            ])
          ),
          states: schema.maybe(schema.oneOf([schema.arrayOf(modelStateSchema), modelStateSchema])),
          nameOrId: schema.maybe(schema.string()),
          versionOrKeyword: schema.maybe(schema.string()),
          modelIds: schema.maybe(schema.oneOf([schema.string(), schema.arrayOf(schema.string())])),
          extra_query: schema.maybe(schema.recordOf(schema.string(), schema.any())),
        }),
      },
    },
    async (context, request) => {
      const {
        algorithms,
        ids,
        from,
        size,
        sort,
        name,
        states,
        nameOrId,
        modelIds,
        versionOrKeyword,
        extra_query: extraQuery,
      } = request.query;
      try {
        const payload = await ModelVersionService.search({
          client: context.core.opensearch.client,
          algorithms: typeof algorithms === 'string' ? [algorithms] : algorithms,
          ids: typeof ids === 'string' ? [ids] : ids,
          from,
          size,
          sort: typeof sort === 'string' ? [sort] : sort,
          name,
          states: typeof states === 'string' ? [states] : states,
          nameOrId,
          modelIds: typeof modelIds === 'string' ? [modelIds] : modelIds,
          versionOrKeyword,
          extraQuery,
        });
        return opensearchDashboardsResponseFactory.ok({ body: payload });
      } catch (err) {
        return opensearchDashboardsResponseFactory.badRequest({ body: err.message });
      }
    }
  );

  router.get(
    {
      path: `${MODEL_VERSION_API_ENDPOINT}/{id}`,
      validate: {
        params: schema.object({
          id: schema.string(),
        }),
      },
    },
    async (context, request) => {
      try {
        const model = await ModelVersionService.getOne({
          client: context.core.opensearch.client,
          id: request.params.id,
        });
        return opensearchDashboardsResponseFactory.ok({ body: model });
      } catch (err) {
        return opensearchDashboardsResponseFactory.badRequest({ body: err.message });
      }
    }
  );

  router.delete(
    {
      path: `${MODEL_VERSION_API_ENDPOINT}/{id}`,
      validate: {
        params: schema.object({
          id: schema.string(),
        }),
      },
    },
    async (context, request) => {
      try {
        await ModelVersionService.delete({
          client: context.core.opensearch.client,
          id: request.params.id,
        });
        return opensearchDashboardsResponseFactory.ok();
      } catch (err) {
        if (err instanceof RecordNotFoundError) {
          return opensearchDashboardsResponseFactory.notFound();
        }
        return opensearchDashboardsResponseFactory.badRequest({ body: err.message });
      }
    }
  );

  router.post(
    {
      path: `${MODEL_VERSION_LOAD_API_ENDPOINT}/{id}`,
      validate: {
        params: schema.object({
          id: schema.string(),
        }),
      },
    },
    async (context, request) => {
      try {
        const result = await ModelVersionService.load({
          client: context.core.opensearch.client,
          id: request.params.id,
        });
        return opensearchDashboardsResponseFactory.ok({ body: result });
      } catch (err) {
        return opensearchDashboardsResponseFactory.badRequest({ body: err.message });
      }
    }
  );

  router.post(
    {
      path: `${MODEL_VERSION_UNLOAD_API_ENDPOINT}/{id}`,
      validate: {
        params: schema.object({
          id: schema.string(),
        }),
      },
    },
    async (context, request) => {
      try {
        const result = await ModelVersionService.unload({
          client: context.core.opensearch.client,
          id: request.params.id,
        });
        return opensearchDashboardsResponseFactory.ok({ body: result });
      } catch (err) {
        return opensearchDashboardsResponseFactory.badRequest({ body: err.message });
      }
    }
  );

  router.get(
    {
      path: `${MODEL_VERSION_PROFILE_API_ENDPOINT}/{id}`,
      validate: {
        params: schema.object({
          id: schema.string(),
        }),
      },
    },
    async (context, request) => {
      try {
        const result = await ModelVersionService.profile({
          client: context.core.opensearch.client,
          id: request.params.id,
        });
        return opensearchDashboardsResponseFactory.ok({ body: result });
      } catch (err) {
        return opensearchDashboardsResponseFactory.badRequest({ body: err.message });
      }
    }
  );

  router.post(
    {
      path: MODEL_VERSION_UPLOAD_API_ENDPOINT,
      validate: {
        body: schema.oneOf([
          modelUploadByURLSchema,
          modelUploadByChunkSchema,
          modelUploadBaseSchema,
        ]),
      },
    },
    async (context, request) => {
      try {
        const body = await ModelVersionService.upload({
          client: context.core.opensearch.client,
          model: request.body,
        });

        return opensearchDashboardsResponseFactory.ok({
          body,
        });
      } catch (err) {
        return opensearchDashboardsResponseFactory.badRequest({ body: err.message });
      }
    }
  );

  router.post(
    {
      path: `${MODEL_VERSION_API_ENDPOINT}/{id}/chunk/{chunkId}`,
      validate: {
        params: schema.object({
          id: schema.string(),
          chunkId: schema.string(),
        }),
        body: schema.buffer(),
      },
      options: {
        body: {
          maxBytes: MAX_MODEL_CHUNK_SIZE,
        },
      },
    },
    async (context, request) => {
      try {
        await ModelVersionService.uploadModelChunk({
          client: context.core.opensearch.client,
          id: request.params.id,
          chunkId: request.params.chunkId,
          chunk: request.body,
        });
        return opensearchDashboardsResponseFactory.ok();
      } catch (err) {
        return opensearchDashboardsResponseFactory.badRequest(err.message);
      }
    }
  );
};
