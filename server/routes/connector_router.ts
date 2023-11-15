/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { IRouter } from '../../../../src/core/server';
import { CONNECTOR_API_ENDPOINT, INTERNAL_CONNECTOR_API_ENDPOINT } from './constants';
import { ConnectorService } from '../services/connector_service';

export const connectorRouter = (router: IRouter) => {
  router.get(
    {
      path: CONNECTOR_API_ENDPOINT,
      validate: {},
    },
    router.handleLegacyErrors(async (context, _req, res) => {
      const payload = await ConnectorService.search({
        client: context.core.opensearch.client,
        from: 0,
        size: 10000,
      });
      return res.ok({ body: payload });
    })
  );
  router.get(
    {
      path: INTERNAL_CONNECTOR_API_ENDPOINT,
      validate: {},
    },
    router.handleLegacyErrors(async (context, _req, res) => {
      const data = await ConnectorService.getUniqueInternalConnectorNames({
        client: context.core.opensearch.client,
        size: 10000,
      });
      return res.ok({ body: { data } });
    })
  );
};
