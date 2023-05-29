/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { schema } from '@osd/config-schema';

import { IRouter, opensearchDashboardsResponseFactory } from '../../../../src/core/server';
import { ModelGroupService } from '../services/model_group_service';

import { MODEL_GROUP_API_ENDPOINT } from './constants';

export const modelGroupRouter = (router: IRouter) => {
  router.post(
    {
      path: MODEL_GROUP_API_ENDPOINT,
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
        const payload = await ModelGroupService.register({
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
      path: `${MODEL_GROUP_API_ENDPOINT}/{groupId}`,
      validate: {
        params: schema.object({
          groupId: schema.string(),
        }),
        body: schema.object({
          name: schema.maybe(schema.string()),
          description: schema.maybe(schema.string()),
        }),
      },
    },
    async (context, request) => {
      const {
        params: { groupId },
        body: { name, description },
      } = request;
      try {
        const payload = await ModelGroupService.update({
          client: context.core.opensearch.client,
          id: groupId,
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
      path: `${MODEL_GROUP_API_ENDPOINT}/{groupId}`,
      validate: {
        params: schema.object({
          groupId: schema.string(),
        }),
      },
    },
    async (context, request) => {
      try {
        const payload = await ModelGroupService.delete({
          client: context.core.opensearch.client,
          id: request.params.groupId,
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
      path: MODEL_GROUP_API_ENDPOINT,
      validate: {
        query: schema.object({
          ids: schema.maybe(schema.oneOf([schema.string(), schema.arrayOf(schema.string())])),
          name: schema.maybe(schema.string()),
          from: schema.number({ min: 0 }),
          size: schema.number({ max: 100 }),
          queryString: schema.maybe(schema.string()),
        }),
      },
    },
    async (context, request) => {
      const { ids, name, from, size, queryString } = request.query;
      try {
        const payload = await ModelGroupService.search({
          client: context.core.opensearch.client,
          ids: typeof ids === 'string' ? [ids] : ids,
          name,
          from,
          size,
          queryString,
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
