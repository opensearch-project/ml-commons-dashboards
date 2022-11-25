/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { schema } from '@osd/config-schema';
import { IRouter, opensearchDashboardsResponseFactory } from '../../../../src/core/server';
import { TaskService, RecordNotFoundError } from '../services';
import {
  TASK_API_ENDPOINT,
  TASK_FUNCTION_API_ENDPOINT,
  TASK_STATE_API_ENDPOINT,
} from './constants';

const taskSortQuerySchema = schema.oneOf([
  schema.literal('lastUpdateTime-desc'),
  schema.literal('lastUpdateTime-asc'),
  schema.literal('createTime-desc'),
  schema.literal('createTime-asc'),
]);

export const taskRouter = (services: { taskService: TaskService }, router: IRouter) => {
  const { taskService } = services;

  router.get(
    {
      path: TASK_API_ENDPOINT,
      validate: {
        query: schema.object({
          ids: schema.maybe(schema.oneOf([schema.string(), schema.arrayOf(schema.string())])),
          functionName: schema.maybe(schema.string()),
          modelId: schema.maybe(schema.string()),
          createdStart: schema.maybe(schema.number()),
          createdEnd: schema.maybe(schema.number()),
          sort: schema.maybe(
            schema.oneOf([taskSortQuerySchema, schema.arrayOf(taskSortQuerySchema)])
          ),
          currentPage: schema.number(),
          pageSize: schema.number(),
        }),
      },
    },
    async (_context, request) => {
      const { currentPage, pageSize, ids, sort, ...restQueries } = request.query;
      try {
        const payload = await taskService.search({
          request,
          ids: typeof ids === 'string' ? [ids] : ids,
          sort: typeof sort === 'string' ? [sort] : sort,
          ...restQueries,
          pagination: { currentPage, pageSize },
        });
        return opensearchDashboardsResponseFactory.ok({ body: payload });
      } catch (err) {
        return opensearchDashboardsResponseFactory.badRequest({ body: err.message });
      }
    }
  );

  router.delete(
    {
      path: `${TASK_API_ENDPOINT}/{taskId}`,
      validate: {
        params: schema.object({
          taskId: schema.string(),
        }),
      },
    },
    async (_context, request) => {
      try {
        await taskService.delete({
          request,
          taskId: request.params.taskId,
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

  router.get(
    {
      path: TASK_FUNCTION_API_ENDPOINT,
      validate: false,
    },
    async (context) => {
      try {
        const body = await TaskService.getAllFunctions({ client: context.core.opensearch.client });
        return opensearchDashboardsResponseFactory.ok({ body });
      } catch (err) {
        return opensearchDashboardsResponseFactory.badRequest({ body: err.message });
      }
    }
  );

  router.get(
    {
      path: TASK_STATE_API_ENDPOINT,
      validate: false,
    },
    async (context) => {
      try {
        const body = await TaskService.getAllStates({ client: context.core.opensearch.client });
        return opensearchDashboardsResponseFactory.ok({ body });
      } catch (err) {
        return opensearchDashboardsResponseFactory.badRequest({ body: err.message });
      }
    }
  );

  router.get(
    {
      path: `${TASK_API_ENDPOINT}/{taskId}`,
      validate: {
        params: schema.object({
          taskId: schema.string(),
        }),
      },
    },
    async (context, request) => {
      try {
        const body = await taskService.getOne({
          client: context.core.opensearch.client,
          taskId: request.params.taskId,
        });
        return opensearchDashboardsResponseFactory.ok({ body });
      } catch (err) {
        return opensearchDashboardsResponseFactory.badRequest({ body: err.message });
      }
    }
  );
};
