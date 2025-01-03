/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { ResponseObject } from '@hapi/hapi';
import { Boom } from '@hapi/boom';

import { Router } from '../../../../../src/core/server/http/router';
import { triggerHandler, createDataSourceEnhancedRouter } from '../router.mock';
import { httpServerMock } from '../../../../../src/core/server/http/http_server.mocks';
import { loggerMock } from '../../../../../src/core/server/logging/logger.mock';
import { MODEL_VERSION_API_ENDPOINT } from '../constants';
import { modelVersionRouter } from '../model_version_router';
import { ModelVersionService } from '../../services';

const setupRouter = () => {
  const mockedLogger = loggerMock.create();
  const {
    router,
    dataSourceTransportMock,
    getLatestCurrentUserTransport,
  } = createDataSourceEnhancedRouter(mockedLogger);

  modelVersionRouter(router);
  return {
    router,
    dataSourceTransportMock,
    getLatestCurrentUserTransport,
  };
};

const triggerModelSearch = (
  router: Router,
  { dataSourceId, from, size }: { dataSourceId?: string; from?: number; size?: number }
) =>
  triggerHandler(router, {
    method: 'GET',
    path: MODEL_VERSION_API_ENDPOINT,
    req: httpServerMock.createRawRequest({
      query: { data_source_id: dataSourceId, from, size },
    }),
  });

jest.mock('../../services/model_version_service');

describe('model version routers', () => {
  beforeEach(() => {
    jest.spyOn(ModelVersionService, 'search');
  });
  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('model version search', () => {
    it('should call connector search and return consistent result', async () => {
      expect(ModelVersionService.search).not.toHaveBeenCalled();
      const { router, getLatestCurrentUserTransport } = setupRouter();

      const result = (await triggerModelSearch(router, { from: 0, size: 50 })) as ResponseObject;
      expect(ModelVersionService.search).toHaveBeenCalledWith(
        expect.objectContaining({
          transport: getLatestCurrentUserTransport(),
          from: 0,
          size: 50,
        })
      );
      expect(result.source).toMatchInlineSnapshot(`
        Object {
          "data": Array [
            Object {
              "name": "Model 1",
            },
          ],
          "total_models": 1,
        }
      `);
    });

    it('should call model search with data source transport', async () => {
      expect(ModelVersionService.search).not.toHaveBeenCalled();
      const { router, dataSourceTransportMock } = setupRouter();

      await triggerModelSearch(router, { dataSourceId: 'foo', from: 0, size: 50 });
      expect(ModelVersionService.search).toHaveBeenCalledWith({
        transport: dataSourceTransportMock,
        from: 0,
        size: 50,
      });
    });

    it('should response error message after model search throw error', async () => {
      jest.spyOn(ModelVersionService, 'search').mockImplementationOnce(() => {
        throw new Error('foo');
      });
      const { router, getLatestCurrentUserTransport } = setupRouter();

      const result = (await triggerModelSearch(router, { from: 0, size: 50 })) as Boom;
      expect(ModelVersionService.search).toHaveBeenCalledWith(
        expect.objectContaining({
          transport: getLatestCurrentUserTransport(),
          from: 0,
          size: 50,
        })
      );
      expect(result.output.payload).toMatchInlineSnapshot(`
        Object {
          "error": "Bad Request",
          "message": "foo",
          "statusCode": 400,
        }
      `);
    });
  });
});
