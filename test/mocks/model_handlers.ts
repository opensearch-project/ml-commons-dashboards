/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { rest } from 'msw';

import { MODEL_API_ENDPOINT } from '../../server/routes/constants';

const models = [
  {
    name: 'model1',
    id: 'model-id-1',
    latest_version: 1,
    description: 'foo bar',
    owner: {
      backend_roles: ['admin'],
      name: 'admin',
      roles: ['admin'],
    },
    created_time: 1683699499637,
    last_updated_time: 1685073391256,
  },
];

export const modelHandlers = [
  rest.get(MODEL_API_ENDPOINT, (req, res, ctx) => {
    const { searchParams } = req.url;
    const name = searchParams.get('name');
    const ids = searchParams.getAll('ids');
    const from = parseInt(searchParams.get('from') || '0', 10);
    const size = parseInt(searchParams.get('size') || `${models.length}`, 10);
    const filteredData = models.filter((model) => {
      if (ids.length > 0) {
        return ids.includes(model.id);
      }
      if (name && name !== model.name) {
        return false;
      }
      return true;
    });
    const end = size ? from + size : filteredData.length;

    return res(
      ctx.status(200),
      ctx.json({
        data: filteredData.slice(from, end),
        total_models: filteredData.length,
      })
    );
  }),

  rest.post(MODEL_API_ENDPOINT, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        model_id: '1',
      })
    );
  }),
];
