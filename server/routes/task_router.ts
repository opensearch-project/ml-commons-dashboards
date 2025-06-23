/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { schema } from '@osd/config-schema';
import { IRouter } from '../../../../src/core/server';
import { TaskService } from '../services';
import { TASK_API_ENDPOINT } from './constants';

const taskSearchSortItemSchema = schema.oneOf([
  schema.literal('last_update_time-desc'),
  schema.literal('last_update_time-asc'),
]);

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
    async (context, request, response) => {
      try {
        const body = await TaskService.getOne({
          client: context.core.opensearch.client,
          taskId: request.params.taskId,
        });
        return response.ok({ body });
      } catch (err) {
        return response.badRequest({ body: err.message });
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
              taskSearchSortItemSchema,
              schema.arrayOf(taskSearchSortItemSchema, { maxSize: 1 }),
            ])
          ),
          model_id: schema.maybe(schema.string()),
          task_type: schema.maybe(schema.string()),
          state: schema.maybe(schema.string()),
        }),
      },
    },
    async (context, request, response) => {
      const { model_id: modelId, task_type: taskType, sort, ...restQuery } = request.query;
      try {
        const body = await TaskService.search({
          client: context.core.opensearch.client,
          modelId,
          taskType,
          sort:
            typeof sort === 'string'
              ? [sort]
              : (sort as ['last_update_time-desc' | 'last_update_time-asc']),
          ...restQuery,
        });
        return response.ok({ body });
      } catch (err) {
        return response.badRequest({ body: err.message });
      }
    }
  );
};
