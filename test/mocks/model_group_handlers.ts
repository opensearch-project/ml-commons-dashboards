/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { rest } from 'msw';

import { MODEL_GROUP_API_ENDPOINT } from '../../server/routes/constants';

const modelGroups = [
  {
    name: 'model1',
    id: '1',
    latest_version: 1,
    description: 'foo bar',
  },
];

export const modelGroupHandlers = [
  rest.get(MODEL_GROUP_API_ENDPOINT, (req, res, ctx) => {
    const { searchParams } = req.url;
    const name = searchParams.get('name');
    const id = searchParams.get('id');
    const from = parseInt(searchParams.get('from') || '0', 10);
    const size = parseInt(searchParams.get('size') || `${modelGroups.length}`, 10);
    const filteredData = modelGroups.filter((modelGroup) => {
      if (id && id !== modelGroup.id) {
        return false;
      }
      if (name && name !== modelGroup.name) {
        return false;
      }
      return true;
    });
    const end = size ? from + size : filteredData.length;

    return res(
      ctx.status(200),
      ctx.json({
        data: filteredData.slice(from, end),
        total_model_groups: filteredData.length,
      })
    );
  }),
];
