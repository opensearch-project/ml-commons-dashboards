/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { ResponseObject } from '@hapi/hapi';

import { Router } from '../../../../../src/core/server/http/router';
import { OpenSearchClient } from '../../../../../src/core/server';
import { triggerHandler, createDataSourceEnhancedRouter } from '../router.mock';
import { httpServerMock } from '../../../../../src/core/server/http/http_server.mocks';
import { loggerMock } from '../../../../../src/core/server/logging/logger.mock';
import { connectorRouter } from '../connector_router';
import { CONNECTOR_API_ENDPOINT, INTERNAL_CONNECTOR_API_ENDPOINT } from '../constants';
import { ConnectorService } from '../../services/connector_service';
import { Boom } from '@hapi/boom';

const setupRouter = ({
  getClient,
}: {
  getClient?: (dataSourceId: string) => Promise<Pick<OpenSearchClient, 'transport'>>;
} = {}) => {
  const mockedLogger = loggerMock.create();
  const {
    router,
    dataSourceTransportMock,
    getLatestCurrentUserTransport,
  } = createDataSourceEnhancedRouter(mockedLogger, getClient);

  connectorRouter(router);
  return {
    router,
    dataSourceTransportMock,
    getLatestCurrentUserTransport,
  };
};

const triggerGetAllConnectors = (router: Router, dataSourceId?: string) =>
  triggerHandler(router, {
    method: 'GET',
    path: CONNECTOR_API_ENDPOINT,
    req: httpServerMock.createRawRequest({ query: { data_source_id: dataSourceId } }),
  });
const triggerGetAllInternalConnectors = (router: Router, dataSourceId?: string) =>
  triggerHandler(router, {
    method: 'GET',
    path: INTERNAL_CONNECTOR_API_ENDPOINT,
    req: httpServerMock.createRawRequest({ query: { data_source_id: dataSourceId } }),
  });

jest.mock('../../services/connector_service');

describe('connector routers', () => {
  beforeEach(() => {
    jest.spyOn(ConnectorService, 'search');
    jest.spyOn(ConnectorService, 'getUniqueInternalConnectorNames');
  });
  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('get all connector', () => {
    it('should call connector search and return consistent result', async () => {
      expect(ConnectorService.search).not.toHaveBeenCalled();
      const { router, getLatestCurrentUserTransport } = setupRouter();
      const result = (await triggerGetAllConnectors(router)) as ResponseObject;
      expect(ConnectorService.search).toHaveBeenCalledWith({
        transport: getLatestCurrentUserTransport(),
        from: 0,
        size: 10000,
      });
      expect(result.source).toMatchInlineSnapshot(`
        Object {
          "data": Array [
            "connector 1",
            "connector 2",
          ],
          "total_connectors": 2,
        }
      `);
    });

    it('should call connector search with data source transport', async () => {
      expect(ConnectorService.search).not.toHaveBeenCalled();
      const { router, dataSourceTransportMock } = setupRouter();

      await triggerGetAllConnectors(router, 'foo');
      expect(ConnectorService.search).toHaveBeenCalledWith({
        transport: dataSourceTransportMock,
        from: 0,
        size: 10000,
      });
    });

    it('should throw 400 error when failed to get data source', async () => {
      const getClientMock = jest.fn().mockRejectedValue(new Error('Unknown error'));
      const { router } = setupRouter({ getClient: getClientMock });

      const result = (await triggerGetAllConnectors(router, 'foo')) as Boom;
      expect(result.output.payload).toMatchInlineSnapshot(`
        Object {
          "error": "Bad Request",
          "message": "Unknown error",
          "statusCode": 400,
        }
      `);
    });
  });

  describe('get all internal connector', () => {
    it('should call connector getUniqueInternalConnectorNames and return consistent result', async () => {
      expect(ConnectorService.getUniqueInternalConnectorNames).not.toHaveBeenCalled();
      const { router, getLatestCurrentUserTransport } = setupRouter();
      const result = (await triggerGetAllInternalConnectors(router)) as ResponseObject;
      expect(ConnectorService.getUniqueInternalConnectorNames).toHaveBeenCalledWith({
        transport: getLatestCurrentUserTransport(),
        size: 10000,
      });
      expect(result.source).toMatchInlineSnapshot(`
        Object {
          "data": undefined,
        }
      `);
    });

    it('should call connector getUniqueInternalConnectorNames with data source transport', async () => {
      expect(ConnectorService.search).not.toHaveBeenCalled();
      const { router, dataSourceTransportMock } = setupRouter();

      await triggerGetAllInternalConnectors(router, 'foo');
      expect(ConnectorService.getUniqueInternalConnectorNames).toHaveBeenCalledWith({
        transport: dataSourceTransportMock,
        size: 10000,
      });
    });

    it('should throw 400 error when failed to get data source', async () => {
      const getClientMock = jest.fn().mockRejectedValue(new Error('Unknown error'));
      const { router } = setupRouter({ getClient: getClientMock });

      const result = (await triggerGetAllInternalConnectors(router, 'foo')) as Boom;
      expect(result.output.payload).toMatchInlineSnapshot(`
        Object {
          "error": "Bad Request",
          "message": "Unknown error",
          "statusCode": 400,
        }
      `);
    });
  });
});
