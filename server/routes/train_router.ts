/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { schema } from '@osd/config-schema';
import { IRouter, opensearchDashboardsResponseFactory } from '../../../../src/core/server';
import { TrainService } from '../services/train_service';
import { TRAIN_API_ENDPOINT } from './constants';

export const trainRouter = (services: { trainService: TrainService }, router: IRouter) => {
  const { trainService } = services;

  router.post(
    {
      path: TRAIN_API_ENDPOINT,
      validate: {
        body: schema.any(),
      },
    },
    async (_context, req) => {
      try {
        const payload = await trainService.trainModel(req);
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
