/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { schema } from '@osd/config-schema';
import { IRouter, opensearchDashboardsResponseFactory } from '../../../../src/core/server';
import { ModelService, RecordNotFoundError } from '../services';
import { MODEL_API_ENDPOINT } from './constants';

const modelSortQuerySchema = schema.oneOf([
  schema.literal('trainTime-desc'),
  schema.literal('trainTime-asc'),
]);

export const modelRouter = (services: { modelService: ModelService }, router: IRouter) => {
  const { modelService } = services;

  router.get(
    {
      path: MODEL_API_ENDPOINT,
      validate: {
        query: schema.object({
          algorithms: schema.maybe(
            schema.oneOf([schema.string(), schema.arrayOf(schema.string())])
          ),
          ids: schema.maybe(schema.oneOf([schema.string(), schema.arrayOf(schema.string())])),
          context: schema.maybe(
            schema.string({
              validate: (value) => {
                const errorMessage = 'must be a object stringify json';
                try {
                  const context = JSON.parse(value);
                  if (typeof context !== 'object') {
                    return errorMessage;
                  }
                } catch (err) {
                  return errorMessage;
                }
              },
            })
          ),
          currentPage: schema.number(),
          pageSize: schema.number(),
          trainedStart: schema.maybe(schema.number()),
          trainedEnd: schema.maybe(schema.number()),
          sort: schema.maybe(
            schema.oneOf([modelSortQuerySchema, schema.arrayOf(modelSortQuerySchema)])
          ),
        }),
      },
    },
    async (_context, request) => {
      const {
        algorithms,
        ids,
        currentPage,
        pageSize,
        context: contextInQuery,
        trainedStart,
        trainedEnd,
        sort,
      } = request.query;
      try {
        const payload = await modelService.search({
          request,
          algorithms: typeof algorithms === 'string' ? [algorithms] : algorithms,
          ids: typeof ids === 'string' ? [ids] : ids,
          pagination: { currentPage, pageSize },
          context: contextInQuery
            ? ((JSON.parse(contextInQuery) as unknown) as Record<string, Array<string | number>>)
            : undefined,
          trainedStart,
          trainedEnd,
          sort: typeof sort === 'string' ? [sort] : sort,
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
};
