/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { schema } from '@osd/config-schema';
import { IRouter, opensearchDashboardsResponseFactory } from '../../../../src/core/server';
import { ModelAggregateService } from '../services/model_aggregate_service';
import { MODEL_AGGREGATE_API_ENDPOINT } from './constants';

export const modelAggregateRouter = (router: IRouter) => {
  router.get(
    {
      path: MODEL_AGGREGATE_API_ENDPOINT,
      validate: {
        query: schema.object({
          currentPage: schema.number(),
          pageSize: schema.number(),
          sort: schema.literal('created_time'),
          order: schema.oneOf([schema.literal('asc'), schema.literal('desc')]),
          name: schema.maybe(schema.string()),
        }),
      },
    },
    async (context, request) => {
      const { currentPage, pageSize, ...restQuery } = request.query;
      try {
        const payload = await ModelAggregateService.search({
          client: context.core.opensearch.client,
          pagination: {
            currentPage,
            pageSize,
          },
          ...restQuery,
        });
        return opensearchDashboardsResponseFactory.ok({ body: payload });
      } catch (err) {
        return opensearchDashboardsResponseFactory.badRequest({ body: err.message });
      }
    }
  );
};
