/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { schema } from '@osd/config-schema';

import { IRouter, opensearchDashboardsResponseFactory } from '../../../../src/core/server';
import { ModelService } from '../services';

import { MODEL_API_ENDPOINT } from './constants';

export const modelRouter = (router: IRouter) => {
  router.post(
    {
      path: MODEL_API_ENDPOINT,
      validate: {
        body: schema.object({
          name: schema.string(),
          description: schema.maybe(schema.string()),
          modelAccessMode: schema.oneOf([
            schema.literal('public'),
            schema.literal('private'),
            schema.literal('restricted'),
          ]),
          backendRoles: schema.maybe(schema.arrayOf(schema.string())),
          addAllBackendRoles: schema.maybe(schema.boolean()),
        }),
      },
    },
    async (context, request) => {
      const { name, description, modelAccessMode, backendRoles, addAllBackendRoles } = request.body;
      try {
        const payload = await ModelService.register({
          client: context.core.opensearch.client,
          name,
          description,
          modelAccessMode,
          backendRoles,
          addAllBackendRoles,
        });
        return opensearchDashboardsResponseFactory.ok({ body: payload });
      } catch (error) {
        return opensearchDashboardsResponseFactory.badRequest({
          body: error instanceof Error ? error.message : JSON.stringify(error),
        });
      }
    }
  );

  router.put(
    {
      path: `${MODEL_API_ENDPOINT}/{id}`,
      validate: {
        params: schema.object({
          id: schema.string(),
        }),
        body: schema.object({
          name: schema.maybe(schema.string()),
          description: schema.maybe(schema.string()),
        }),
      },
    },
    async (context, request) => {
      const {
        params: { id },
        body: { name, description },
      } = request;
      try {
        const payload = await ModelService.update({
          client: context.core.opensearch.client,
          id,
          name,
          description,
        });
        return opensearchDashboardsResponseFactory.ok({ body: payload });
      } catch (error) {
        return opensearchDashboardsResponseFactory.badRequest({
          body: error instanceof Error ? error.message : JSON.stringify(error),
        });
      }
    }
  );

  router.delete(
    {
      path: `${MODEL_API_ENDPOINT}/{id}`,
      validate: {
        params: schema.object({
          id: schema.string(),
        }),
      },
    },
    async (context, request) => {
      try {
        const payload = await ModelService.delete({
          client: context.core.opensearch.client,
          id: request.params.id,
        });
        return opensearchDashboardsResponseFactory.ok({ body: payload });
      } catch (error) {
        return opensearchDashboardsResponseFactory.badRequest({
          body: error instanceof Error ? error.message : JSON.stringify(error),
        });
      }
    }
  );

  router.get(
    {
      path: MODEL_API_ENDPOINT,
      validate: {
        query: schema.object({
          ids: schema.maybe(schema.oneOf([schema.string(), schema.arrayOf(schema.string())])),
          name: schema.maybe(schema.string()),
          from: schema.number({ min: 0 }),
          size: schema.number({ max: 100 }),
          extraQuery: schema.maybe(schema.recordOf(schema.string(), schema.any())),
        }),
      },
    },
    async (context, request) => {
      const { ids, name, from, size, extraQuery } = request.query;
      try {
        const payload = await ModelService.search({
          client: context.core.opensearch.client,
          ids: typeof ids === 'string' ? [ids] : ids,
          name,
          from,
          size,
          extraQuery,
        });
        return opensearchDashboardsResponseFactory.ok({ body: payload });
      } catch (error) {
        return opensearchDashboardsResponseFactory.badRequest({
          body: error instanceof Error ? error.message : JSON.stringify(error),
        });
      }
    }
  );
};
