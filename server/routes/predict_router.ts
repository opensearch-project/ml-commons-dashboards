/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { schema } from '@osd/config-schema';
import { IRouter, opensearchDashboardsResponseFactory } from '../../../../src/core/server';
import { PredictService } from '../services/predict_service';
import { PREDICT_API_ENDPOINT } from './constants';

export const predictRouter = (services: { predictService: PredictService }, router: IRouter) => {
  const { predictService } = services;

  router.post(
    {
      path: `${PREDICT_API_ENDPOINT}/{algo}/{modelId}`,
      validate: {
        params: schema.object({
          algo: schema.string(),
          modelId: schema.string(),
        }),
        body: schema.any(),
      },
    },

    async (_context, request) => {
      const { modelId, algo } = request.params;
      try {
        const payload = await predictService.predict({ request, modelId, algo });
        return opensearchDashboardsResponseFactory.ok({ body: payload });
      } catch (err) {
        // Temporarily set error response ok to pass err detail to web
        return opensearchDashboardsResponseFactory.ok({
          body: {
            message: err.message,
          },
        });
      }
    }
  );
};
