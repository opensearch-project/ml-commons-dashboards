/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { schema } from '@osd/config-schema';
import { IRouter, opensearchDashboardsResponseFactory } from '../../../../src/core/server';
import { ProfileService } from '../services/profile_service';
import { DEPLOYED_MODEL_PROFILE_API_ENDPOINT } from './constants';

export const profileRouter = (router: IRouter) => {
  router.get(
    {
      path: `${DEPLOYED_MODEL_PROFILE_API_ENDPOINT}/{modelId}`,
      validate: {
        params: schema.object({
          modelId: schema.string(),
        }),
      },
    },
    async (context, request) => {
      try {
        const payload = await ProfileService.getModel({
          client: context.core.opensearch.client,
          modelId: request.params.modelId,
        });
        return opensearchDashboardsResponseFactory.ok({ body: payload });
      } catch (error) {
        return opensearchDashboardsResponseFactory.badRequest({ body: error as Error });
      }
    }
  );
};
