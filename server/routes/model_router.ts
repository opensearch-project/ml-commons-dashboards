/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { schema } from '@osd/config-schema';
import { MODEL_STATE } from '../../common';
import { IRouter, opensearchDashboardsResponseFactory } from '../../../../src/core/server';
import { ModelService } from '../services';
import { MODEL_API_ENDPOINT } from './constants';

const modelSortQuerySchema = schema.oneOf([
  schema.literal('name-asc'),
  schema.literal('name-desc'),
]);

const modelStateSchema = schema.oneOf([
  schema.literal(MODEL_STATE.loadFailed),
  schema.literal(MODEL_STATE.loaded),
  schema.literal(MODEL_STATE.loading),
  schema.literal(MODEL_STATE.partialLoaded),
  schema.literal(MODEL_STATE.trained),
  schema.literal(MODEL_STATE.uploaded),
  schema.literal(MODEL_STATE.unloaded),
  schema.literal(MODEL_STATE.uploading),
]);

export const modelRouter = (router: IRouter) => {
  router.get(
    {
      path: MODEL_API_ENDPOINT,
      validate: {
        query: schema.object({
          currentPage: schema.number(),
          pageSize: schema.number(),
          sort: schema.maybe(
            schema.oneOf([modelSortQuerySchema, schema.arrayOf(modelSortQuerySchema)])
          ),
          states: schema.maybe(schema.oneOf([schema.arrayOf(modelStateSchema), modelStateSchema])),
          nameOrId: schema.maybe(schema.string()),
        }),
      },
    },
    async (context, request) => {
      const { currentPage, pageSize, sort, states, nameOrId } = request.query;
      try {
        const payload = await ModelService.search({
          client: context.core.opensearch.client,
          pagination: { currentPage, pageSize },
          sort: typeof sort === 'string' ? [sort] : sort,
          states: typeof states === 'string' ? [states] : states,
          nameOrId,
        });
        return opensearchDashboardsResponseFactory.ok({ body: payload });
      } catch (err) {
        return opensearchDashboardsResponseFactory.badRequest({ body: err.message });
      }
    }
  );
};
