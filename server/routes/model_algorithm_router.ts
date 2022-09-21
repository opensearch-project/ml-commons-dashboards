/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { schema } from '@osd/config-schema';
import { IRouter, opensearchDashboardsResponseFactory } from '../../../../src/core/server';
import { ModelAlgorithmService } from '../services/model_algorithm_service';
import { MODEL_ALGORITHM_API_ENDPOINT } from './constants';

export const modelAlgorithmRouter = (
  services: { modelAlgorithmService: ModelAlgorithmService },
  router: IRouter
) => {
  const { modelAlgorithmService } = services;

  router.get(
    {
      path: MODEL_ALGORITHM_API_ENDPOINT,
      validate: false,
    },
    async (_context, request) => {
      try {
        const payload = await modelAlgorithmService.getAll({
          request,
        });
        return opensearchDashboardsResponseFactory.ok({ body: payload });
      } catch (err) {
        return opensearchDashboardsResponseFactory.badRequest({ body: err.message });
      }
    }
  );

  router.get(
    {
      path: `${MODEL_ALGORITHM_API_ENDPOINT}/{algorithm}`,
      validate: {
        params: schema.object({
          algorithm: schema.string(),
        }),
      },
    },
    async (context, request) => {
      const { algorithm } = request.params;

      try {
        const body = await modelAlgorithmService.getOne({
          client: context.core.opensearch.client,
          algorithm,
        });
        return opensearchDashboardsResponseFactory.ok({
          body,
        });
      } catch (err) {
        return opensearchDashboardsResponseFactory.badRequest({ body: err.message });
      }
    }
  );
};
