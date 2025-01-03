/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { schema } from '@osd/config-schema';
import { IRouter } from '../../../../src/core/server';
import { ModelAggregateService } from '../services/model_aggregate_service';
import { MODEL_AGGREGATE_API_ENDPOINT } from './constants';
import { modelStateSchema } from './model_version_router';

export const modelAggregateRouter = (router: IRouter) => {
  router.get(
    {
      path: MODEL_AGGREGATE_API_ENDPOINT,
      validate: {
        query: schema.object({
          from: schema.number(),
          size: schema.number(),
          sort: schema.maybe(
            schema.oneOf([
              schema.literal('name-asc'),
              schema.literal('name-desc'),
              schema.literal('latest_version-asc'),
              schema.literal('latest_version-desc'),
              schema.literal('description-asc'),
              schema.literal('description-desc'),
              schema.literal('owner_name-asc'),
              schema.literal('owner_name-desc'),
              schema.literal('last_updated_time-asc'),
              schema.literal('last_updated_time-desc'),
            ])
          ),
          name: schema.maybe(schema.string()),
          states: schema.maybe(schema.oneOf([modelStateSchema, schema.arrayOf(modelStateSchema)])),
          extraQuery: schema.maybe(schema.recordOf(schema.string(), schema.any())),
        }),
      },
    },
    async (context, request, response) => {
      const { states, extraQuery, ...restQuery } = request.query;
      try {
        const payload = await ModelAggregateService.search({
          client: context.core.opensearch.client,
          states: typeof states === 'string' ? [states] : states,
          extraQuery,
          ...restQuery,
        });
        return response.ok({ body: payload });
      } catch (error) {
        return response.badRequest({
          body: error instanceof Error ? error.message : JSON.stringify(error),
        });
      }
    }
  );
};
