/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { rest } from 'msw';
import { modelConfig } from './data/model_config';
import { modelRepositoryResponse } from './data/model_repository';
import { modelHandlers } from './model_handlers';

export const handlers = [
  rest.get('/api/ml-commons/model-repository', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(modelRepositoryResponse));
  }),
  rest.get('/api/ml-commons/model-repository/config-url/:config_url', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(modelConfig));
  }),
  ...modelHandlers,
];
