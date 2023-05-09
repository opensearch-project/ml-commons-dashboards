/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { rest } from 'msw';

import { TASK_API_ENDPOINT } from '../../server/routes/constants';

const tasks = [
  {
    name: 'model1',
    model_id: '1',
    task_type: 'REGISTER_MODEL',
    error: 'The artifact url is in valid',
  },
];

export const taskHandlers = [
  rest.get(TASK_API_ENDPOINT, (req, res, ctx) => {
    const filteredData = tasks.filter((task) => {
      const {
        params: { model_id: modelId, task_type: taskType },
      } = req;
      if (modelId && modelId !== task.model_id) {
        return false;
      }
      if (taskType && taskType !== task.task_type) {
        return false;
      }
      return true;
    });
    const start = typeof req.params.from === 'number' ? req.params.from : 0;
    const end = typeof req.params.size === 'number' ? start + req.params.size : filteredData.length;

    return res(
      ctx.status(200),
      ctx.json({
        data: filteredData.slice(start, end),
        total_tasks: filteredData.length,
      })
    );
  }),
];
