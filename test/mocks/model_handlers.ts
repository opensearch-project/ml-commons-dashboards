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
    description: 'model1 description',
    created_time: 1683699467964,
    last_registered_time: 1683699499632,
    last_updated_time: 1683699499637,
    model_config: {
      all_config: '',
      embedding_dimension: 768,
      framework_type: 'SENTENCE_TRANSFORMERS',
      model_type: 'roberta',
    },
    model_format: 'TORCH_SCRIPT',
    model_state: 'REGISTERED',
    total_chunks: 34,
  },
  {
    id: '2',
    name: 'model2',
    model_version: '1.0.1',
    description: 'model2 description',
    created_time: 1683699467964,
    last_registered_time: 1683699499632,
    last_updated_time: 1683699499637,
    model_config: {
      all_config: '',
      embedding_dimension: 768,
      framework_type: 'SENTENCE_TRANSFORMERS',
      model_type: 'roberta',
    },
    model_format: 'TORCH_SCRIPT',
    model_state: 'REGISTERED',
    total_chunks: 34,
  },
  {
    id: '3',
    name: 'model3',
    model_version: '1.0.0',
    description: 'model3 description',
    created_time: 1683699467964,
    last_registered_time: 1683699499632,
    last_updated_time: 1683699499637,
    model_config: {
      all_config: '',
      embedding_dimension: 768,
      framework_type: 'SENTENCE_TRANSFORMERS',
      model_type: 'roberta',
    },
    model_format: 'TORCH_SCRIPT',
    model_state: 'DEPLOYED',
    total_chunks: 34,
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
