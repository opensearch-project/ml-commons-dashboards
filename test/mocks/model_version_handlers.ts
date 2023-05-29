/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { rest } from 'msw';

import { MODEL_VERSION_API_ENDPOINT } from '../../server/routes/constants';

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
    model_state: 'PARTIALLY_DEPLOYED',
    total_chunks: 34,
    model_group_id: '1',
    current_worker_node_count: 1,
    planning_worker_node_count: 3,
    planning_worker_nodes: ['node1', 'node2', 'node3'],
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
    model_group_id: '2',
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
    model_group_id: '3',
  },
  {
    id: '4',
    name: 'model1',
    model_version: '1.0.1',
    description: 'model1 version 1.0.1 description',
    created_time: 1683699469964,
    last_registered_time: 1683699599632,
    last_updated_time: 1683699599637,
    model_config: {
      all_config: '',
      embedding_dimension: 768,
      framework_type: 'SENTENCE_TRANSFORMERS',
      model_type: 'roberta',
    },
    model_format: 'TORCH_SCRIPT',
    model_state: 'DEPLOYED',
    total_chunks: 34,
    model_group_id: '1',
  },
];

export const modelVersionHandlers = [
  rest.get(MODEL_VERSION_API_ENDPOINT, (req, res, ctx) => {
    const { searchParams } = req.url;
    const name = searchParams.get('name');
    const ids = searchParams.getAll('ids');
    const modelGroupIds = searchParams.getAll('modelGroupIds');
    const data = models.filter((model) => {
      if (name) {
        return model.name === name;
      }
      if (ids.length > 0) {
        return ids.includes(model.id);
      }
      if (modelGroupIds.length > 0) {
        return modelGroupIds.includes(model.model_group_id);
      }
      return true;
    });
    return res(
      ctx.status(200),
      ctx.json({
        data,
        total_models: data.length,
      })
    );
  }),

  rest.get(`${MODEL_VERSION_API_ENDPOINT}/:modelId`, (req, res, ctx) => {
    const [modelId, ..._restParts] = req.url.pathname.split('/').reverse();
    return res(ctx.status(200), ctx.json(models.find((model) => model.id === modelId)));
  }),
];
