/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { IRouter } from '../../../../src/core/server';
import { SecurityService } from '../services/security_service';
import { SECURITY_ACCOUNT_API_ENDPOINT } from './constants';

export const securityRouter = (router: IRouter) => {
  router.get(
    {
      path: SECURITY_ACCOUNT_API_ENDPOINT,
      validate: false,
    },
    async (context, _request, response) => {
      try {
        const body = await SecurityService.getAccount({
          client: context.core.opensearch.client,
        });
        return response.ok({ body });
      } catch (error) {
        return response.badRequest({ body: error as Error });
      }
    }
  );
};
