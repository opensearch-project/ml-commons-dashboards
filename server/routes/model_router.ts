/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { schema } from '@osd/config-schema';
import { MAX_MODEL_CHUNK_SIZE, MODEL_STATE } from '../../common';
import { IRouter, opensearchDashboardsResponseFactory } from '../../../../src/core/server';
import { ModelService, RecordNotFoundError } from '../services';
import {
  MODEL_API_ENDPOINT,
  MODEL_LOAD_API_ENDPOINT,
  MODEL_UNLOAD_API_ENDPOINT,
  MODEL_UPLOAD_API_ENDPOINT,
  MODEL_PROFILE_API_ENDPOINT,
} from './constants';

const modelSortQuerySchema = schema.oneOf([
  schema.literal('version-desc'),
  schema.literal('version-asc'),
  schema.literal('name-asc'),
  schema.literal('name-desc'),
]);

const modelStateSchema = schema.oneOf([
  schema.literal(MODEL_STATE.loadFailed),
  schema.literal(MODEL_STATE.loaded),
  schema.literal(MODEL_STATE.loading),
  schema.literal(MODEL_STATE.partialLoaded),
  schema.literal(MODEL_STATE.trained),
  schema.literal(MODEL_STATE.uploaded),
  schema.literal(MODEL_STATE.unloaded),
  schema.literal(MODEL_STATE.uploading),
]);

const modelUploadBaseSchema = {
  name: schema.string(),
  version: schema.string(),
  description: schema.string(),
  modelFormat: schema.string(),
  modelConfig: schema.object({
    modelType: schema.string(),
    embeddingDimension: schema.number(),
    frameworkType: schema.string(),
  }),
};

const modelUploadByURLSchema = schema.object({
  ...modelUploadBaseSchema,
  url: schema.string(),
});

const modelUploadByChunkSchema = schema.object({
  ...modelUploadBaseSchema,
  modelTaskType: schema.string(),
  modelContentHashValue: schema.string(),
  totalChunks: schema.number(),
});

export const modelRouter = (services: { modelService: ModelService }, router: IRouter) => {
  const { modelService } = services;

  router.get(
    {
      path: MODEL_API_ENDPOINT,
      validate: {
        query: schema.object({
          name: schema.maybe(schema.string()),
          algorithms: schema.maybe(
            schema.oneOf([schema.string(), schema.arrayOf(schema.string())])
          ),
          ids: schema.maybe(schema.oneOf([schema.string(), schema.arrayOf(schema.string())])),
          currentPage: schema.number(),
          pageSize: schema.number(),
          sort: schema.maybe(
            schema.oneOf([modelSortQuerySchema, schema.arrayOf(modelSortQuerySchema)])
          ),
          states: schema.maybe(schema.oneOf([schema.arrayOf(modelStateSchema), modelStateSchema])),
          nameOrId: schema.maybe(schema.string()),
        }),
      },
    },
    async (context, request) => {
      const {
        algorithms,
        ids,
        currentPage,
        pageSize,
        sort,
        name,
        states,
        nameOrId,
      } = request.query;
      try {
        const payload = await ModelService.search({
          client: context.core.opensearch.client,
          algorithms: typeof algorithms === 'string' ? [algorithms] : algorithms,
          ids: typeof ids === 'string' ? [ids] : ids,
          pagination: { currentPage, pageSize },
          sort: typeof sort === 'string' ? [sort] : sort,
          name,
          states: typeof states === 'string' ? [states] : states,
          nameOrId,
        });
        return opensearchDashboardsResponseFactory.ok({ body: payload });
      } catch (err) {
        return opensearchDashboardsResponseFactory.badRequest({ body: err.message });
      }
    }
  );

  router.get(
    {
      path: `${MODEL_API_ENDPOINT}/{modelId}`,
      validate: {
        params: schema.object({
          modelId: schema.string(),
        }),
      },
    },
    async (_context, request) => {
      try {
        const model = await modelService.getOne({
          request,
          modelId: request.params.modelId,
        });
        return opensearchDashboardsResponseFactory.ok({ body: model });
      } catch (err) {
        return opensearchDashboardsResponseFactory.badRequest({ body: err.message });
      }
    }
  );

  router.delete(
    {
      path: `${MODEL_API_ENDPOINT}/{modelId}`,
      validate: {
        params: schema.object({
          modelId: schema.string(),
        }),
      },
    },
    async (_context, request) => {
      try {
        await modelService.delete({
          request,
          modelId: request.params.modelId,
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
      path: `${MODEL_LOAD_API_ENDPOINT}/{modelId}`,
      validate: {
        params: schema.object({
          modelId: schema.string(),
        }),
      },
    },
    async (_context, request) => {
      try {
        const result = await modelService.load({
          request,
          modelId: request.params.modelId,
        });
        return opensearchDashboardsResponseFactory.ok({ body: result });
      } catch (err) {
        return opensearchDashboardsResponseFactory.badRequest({ body: err.message });
      }
    }
  );

  router.post(
    {
      path: `${MODEL_UNLOAD_API_ENDPOINT}/{modelId}`,
      validate: {
        params: schema.object({
          modelId: schema.string(),
        }),
      },
    },
    async (_context, request) => {
      try {
        const result = await modelService.unload({
          request,
          modelId: request.params.modelId,
        });
        return opensearchDashboardsResponseFactory.ok({ body: result });
      } catch (err) {
        return opensearchDashboardsResponseFactory.badRequest({ body: err.message });
      }
    }
  );

  router.get(
    {
      path: `${MODEL_PROFILE_API_ENDPOINT}/{modelId}`,
      validate: {
        params: schema.object({
          modelId: schema.string(),
        }),
      },
    },
    async (_context, request) => {
      try {
        const result = await modelService.profile({
          request,
          modelId: request.params.modelId,
        });
        return opensearchDashboardsResponseFactory.ok({ body: result });
      } catch (err) {
        return opensearchDashboardsResponseFactory.badRequest({ body: err.message });
      }
    }
  );

  router.post(
    {
      path: MODEL_UPLOAD_API_ENDPOINT,
      validate: {
        body: schema.oneOf([modelUploadByURLSchema, modelUploadByChunkSchema]),
      },
    },
    async (context, request) => {
      try {
        const body = await ModelService.upload({
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
      path: `${MODEL_API_ENDPOINT}/{modelId}/chunk/{chunkId}`,
      validate: {
        params: schema.object({
          modelId: schema.string(),
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
        await ModelService.uploadModelChunk({
          client: context.core.opensearch.client,
          modelId: request.params.modelId,
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
