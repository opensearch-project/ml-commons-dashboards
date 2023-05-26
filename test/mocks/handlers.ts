/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { rest } from 'msw';

import { MODEL_AGGREGATE_API_ENDPOINT } from '../../server/routes/constants';

import { modelConfig } from './data/model_config';
import { modelRepositoryResponse } from './data/model_repository';
import { modelHandlers } from './model_handlers';
import { modelAggregateResponse } from './data/model_aggregate';
import { taskHandlers } from './task_handlers';
import { modelGroupHandlers } from './model_group_handlers';

export const handlers = [
  rest.get('/api/ml-commons/model-repository', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(modelRepositoryResponse));
  }),
  rest.get('/api/ml-commons/model-repository/config-url/:config_url', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(modelConfig));
  }),
  ...modelHandlers,
  rest.get(MODEL_AGGREGATE_API_ENDPOINT, (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json(modelAggregateResponse));
  }),
  ...taskHandlers,
  ...modelGroupHandlers,
];
