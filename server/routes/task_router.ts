/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { schema } from '@osd/config-schema';
import { IRouter, opensearchDashboardsResponseFactory } from '../../../../src/core/server';
import { TaskService } from '../services';
import { TASK_API_ENDPOINT } from './constants';

export const taskRouter = (router: IRouter) => {
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
        const body = await TaskService.getOne({
          client: context.core.opensearch.client,
          taskId: request.params.taskId,
        });
        return opensearchDashboardsResponseFactory.ok({ body });
      } catch (err) {
        return opensearchDashboardsResponseFactory.badRequest({ body: err.message });
      }
    }
  );
  router.get(
    {
      path: TASK_API_ENDPOINT,
      validate: {
        query: schema.object({
          from: schema.number(),
          size: schema.number(),
          sort: schema.maybe(
            schema.oneOf([
              schema.oneOf([
                schema.literal('last_update_time-desc'),
                schema.literal('last_update_time-asc'),
              ]),
              schema.arrayOf(
                schema.oneOf([
                  schema.literal('last_update_time-desc'),
                  schema.literal('last_update_time-asc'),
                ])
              ),
            ])
          ),
          model_id: schema.maybe(schema.string()),
          task_type: schema.maybe(schema.string()),
          state: schema.maybe(schema.string()),
        }),
      },
    },
    async (context, request) => {
      const { model_id: modelId, task_type: taskType, sort, ...restQuery } = request.query;
      try {
        const body = await TaskService.search({
          client: context.core.opensearch.client,
          modelId,
          taskType,
          sort: typeof sort === 'string' ? [sort] : sort,
          ...restQuery,
        });
        return opensearchDashboardsResponseFactory.ok({ body });
      } catch (err) {
        return opensearchDashboardsResponseFactory.badRequest({ body: err.message });
      }
    }
  );
};
