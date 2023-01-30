/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { IRouter, opensearchDashboardsResponseFactory } from '../../../../src/core/server';
import { SecurityService } from '../services/security_service';
import { SECURITY_ACCOUNT_API_ENDPOINT } from './constants';

export const securityRouter = (router: IRouter) => {
  router.get(
    {
      path: SECURITY_ACCOUNT_API_ENDPOINT,
      validate: false,
    },
    async (context) => {
      try {
        const body = await SecurityService.getAccount({
          client: context.core.opensearch.client,
        });
        return opensearchDashboardsResponseFactory.ok({ body });
      } catch (error) {
        return opensearchDashboardsResponseFactory.badRequest({ body: error as Error });
      }
    }
  );
};
