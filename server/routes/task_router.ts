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
};
