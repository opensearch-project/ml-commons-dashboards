/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { MlCommonsPlugin } from '../plugin';
import { coreMock, httpServiceMock } from '../../../../src/core/server/mocks';
import * as modelVersionRouterExports from '../routes/model_version_router';
import * as connectorRouterExports from '../routes/connector_router';
import * as profileRouterExports from '../routes/profile_router';

describe('MlCommonsPlugin', () => {
  describe('setup', () => {
    let mockCoreSetup: ReturnType<typeof coreMock.createSetup>;
    let initContext: ReturnType<typeof coreMock.createPluginInitializerContext>;
    let routerMock: ReturnType<typeof httpServiceMock.createRouter>;

    beforeEach(() => {
      mockCoreSetup = coreMock.createSetup();
      routerMock = httpServiceMock.createRouter();
      mockCoreSetup.http.createRouter.mockReturnValue(routerMock);
      initContext = coreMock.createPluginInitializerContext();
    });

    it('should register model version routers', () => {
      jest.spyOn(modelVersionRouterExports, 'modelVersionRouter');
      new MlCommonsPlugin(initContext).setup(mockCoreSetup);
      expect(modelVersionRouterExports.modelVersionRouter).toHaveBeenCalledWith(routerMock);
    });

    it('should register connector routers', () => {
      jest.spyOn(connectorRouterExports, 'connectorRouter');
      new MlCommonsPlugin(initContext).setup(mockCoreSetup);
      expect(connectorRouterExports.connectorRouter).toHaveBeenCalledWith(routerMock);
    });

    it('should register profile routers', () => {
      jest.spyOn(profileRouterExports, 'profileRouter');
      new MlCommonsPlugin(initContext).setup(mockCoreSetup);
      expect(profileRouterExports.profileRouter).toHaveBeenCalledWith(routerMock);
    });
  });
});
