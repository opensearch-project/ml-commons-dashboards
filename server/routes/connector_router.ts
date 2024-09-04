/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { schema } from '@osd/config-schema';
import { IRouter } from '../../../../src/core/server';
import { CONNECTOR_API_ENDPOINT, INTERNAL_CONNECTOR_API_ENDPOINT } from './constants';
import { ConnectorService } from '../services/connector_service';
import { getOpenSearchClientTransport } from './utils';

export const connectorRouter = (router: IRouter) => {
  router.get(
    {
      path: CONNECTOR_API_ENDPOINT,
      validate: {
        query: schema.object({
          data_source_id: schema.maybe(schema.string()),
        }),
      },
    },
    async (context, request, res) => {
      try {
        const payload = await ConnectorService.search({
          transport: await getOpenSearchClientTransport({
            dataSourceId: request.query.data_source_id,
            context,
          }),
          from: 0,
          size: 10000,
        });
        return res.ok({ body: payload });
      } catch (err) {
        return res.badRequest({ body: err.message });
      }
    }
  );
  router.get(
    {
      path: INTERNAL_CONNECTOR_API_ENDPOINT,
      validate: {
        query: schema.object({
          data_source_id: schema.maybe(schema.string()),
        }),
      },
    },
    async (context, request, res) => {
      try {
        const data = await ConnectorService.getUniqueInternalConnectorNames({
          transport: await getOpenSearchClientTransport({
            dataSourceId: request.query.data_source_id,
            context,
          }),
          size: 10000,
        });
        return res.ok({ body: { data } });
      } catch (err) {
        return res.badRequest({ body: err.message });
      }
    }
  );
};
