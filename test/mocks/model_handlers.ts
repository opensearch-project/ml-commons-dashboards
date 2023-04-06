/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { rest } from 'msw';

import { MODEL_API_ENDPOINT } from '../../server/routes/constants';

const models = [
  {
    id: '1',
    name: 'model1',
    model_version: '1.0.0',
  },
  {
    id: '2',
    model: 'model1',
    model_version: '1.0.1',
  },
  {
    id: '3',
    model: 'model2',
    model_version: '1.0.0',
  },
];

export const modelHandlers = [
  rest.get(MODEL_API_ENDPOINT, (req, res, ctx) => {
    const data = models.filter((model) => !req.params.name || model.name === req.params.name);
    return res(
      ctx.status(200),
      ctx.json({
        data,
        total_models: data.length,
      })
    );
  }),

  rest.get(`${MODEL_API_ENDPOINT}/:modelId`, (req, res, ctx) => {
    const [modelId, ..._restParts] = req.url.pathname.split('/').reverse();
    return res(ctx.status(200), ctx.json(models.find((model) => model.id === modelId)));
  }),
];
