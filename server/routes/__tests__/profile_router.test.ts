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
import { DEPLOYED_MODEL_PROFILE_API_ENDPOINT } from '../constants';
import { ProfileService } from '../../services/profile_service';
import { profileRouter } from '../profile_router';

const setupRouter = () => {
  const mockedLogger = loggerMock.create();
  const {
    router,
    dataSourceTransportMock,
    getLatestCurrentUserTransport,
  } = createDataSourceEnhancedRouter(mockedLogger);

  profileRouter(router);
  return {
    router,
    dataSourceTransportMock,
    getLatestCurrentUserTransport,
  };
};

const triggerGetModelProfile = (
  router: Router,
  { dataSourceId, modelId }: { dataSourceId?: string; modelId: string }
) =>
  triggerHandler(router, {
    method: 'GET',
    path: `${DEPLOYED_MODEL_PROFILE_API_ENDPOINT}/{modelId}`,
    req: httpServerMock.createRawRequest({
      query: { data_source_id: dataSourceId },
      params: { modelId },
    }),
  });

jest.mock('../../services/profile_service');

describe('profile routers', () => {
  beforeEach(() => {
    jest.spyOn(ProfileService, 'getModel');
  });
  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('get model profile', () => {
    it('should call get model profile and return consistent result', async () => {
      expect(ProfileService.getModel).not.toHaveBeenCalled();
      const { router, getLatestCurrentUserTransport } = setupRouter();

      const result = (await triggerGetModelProfile(router, {
        modelId: 'model-1',
      })) as ResponseObject;
      expect(ProfileService.getModel).toHaveBeenCalledWith({
        modelId: 'model-1',
        transport: getLatestCurrentUserTransport(),
      });
      expect(result.source).toMatchInlineSnapshot(`
        Object {
          "id": "model-1",
          "not_worker_nodes": Array [],
          "target_worker_nodes": Array [
            "node-1",
          ],
          "worker_nodes": Array [
            "node-1",
          ],
        }
      `);
    });

    it('should call get model profile with data source transport', async () => {
      expect(ProfileService.getModel).not.toHaveBeenCalled();
      const { router, dataSourceTransportMock } = setupRouter();

      await triggerGetModelProfile(router, { dataSourceId: 'foo', modelId: 'model-1' });
      expect(ProfileService.getModel).toHaveBeenCalledWith({
        modelId: 'model-1',
        transport: dataSourceTransportMock,
      });
    });

    it('should response consistent error message after get model profile throw error', async () => {
      jest.spyOn(ProfileService, 'getModel').mockImplementationOnce(() => {
        throw new Error('foo');
      });
      const { router } = setupRouter();

      const result = (await triggerGetModelProfile(router, {
        dataSourceId: 'foo',
        modelId: 'model-1',
      })) as Boom;
      expect(result.output.payload).toMatchInlineSnapshot(`
        Object {
          "error": "Bad Request",
          "message": "foo",
          "statusCode": 400,
        }
      `);
    });

    it('should response invalid model id', async () => {
      const { router } = setupRouter();

      const result = (await triggerGetModelProfile(router, {
        dataSourceId: 'foo',
        modelId: 'foo~!',
      })) as Boom;
      expect(result.output.payload).toMatchInlineSnapshot(`
        Object {
          "error": "Bad Request",
          "message": "[request params.modelId]: Invalid model id",
          "statusCode": 400,
        }
      `);
    });
  });
});
