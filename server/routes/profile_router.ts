/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { schema } from '@osd/config-schema';

import { IRouter } from '../../../../src/core/server';
import { ProfileService } from '../services/profile_service';
import { DEPLOYED_MODEL_PROFILE_API_ENDPOINT } from './constants';
import { getOpenSearchClientTransport } from './utils';

export const profileRouter = (router: IRouter) => {
  router.get(
    {
      path: `${DEPLOYED_MODEL_PROFILE_API_ENDPOINT}/{modelId}`,
      validate: {
        params: schema.object({
          modelId: schema.string({
            validate: (value) => {
              if (!/^[a-zA-Z0-9_-]+$/.test(value)) {
                return 'Invalid model id';
              }
            },
          }),
        }),
        query: schema.object({
          data_source_id: schema.maybe(schema.string()),
        }),
      },
    },
    async (context, request, response) => {
      try {
        const payload = await ProfileService.getModel({
          transport: await getOpenSearchClientTransport({
            dataSourceId: request.query.data_source_id,
            context,
          }),
          modelId: request.params.modelId,
        });
        return response.ok({ body: payload });
      } catch (error) {
        return response.badRequest({ body: error as Error });
      }
    }
  );
};
