/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { rest } from 'msw';

import { useDeployment } from '../use_deployment';
import { waitFor, renderHook } from '../../../test/test_utils';
import * as PluginContext from '../../../../../src/plugins/opensearch_dashboards_react/public';
import { ModelVersion } from '../../../public/apis/model_version';
import { server } from '../../../test/mocks/server';
import {
  MODEL_VERSION_UNLOAD_API_ENDPOINT,
  TASK_API_ENDPOINT,
} from '../../../server/routes/constants';

// Cannot spyOn(PluginContext, 'useOpenSearchDashboards') directly as it results in error:
// TypeError: Cannot redefine property: useOpenSearchDashboards
// So we have to mock the entire module first as a workaround
jest.mock('../../../../../src/plugins/opensearch_dashboards_react/public', () => {
  return {
    __esModule: true,
    ...jest.requireActual('../../../../../src/plugins/opensearch_dashboards_react/public'),
  };
});

describe('useDeployment hook', () => {
  const addDangerMock = jest.fn();
  const addSuccessMock = jest.fn();
  const openModalMock = jest.fn();

  beforeEach(() => {
    jest.spyOn(PluginContext, 'useOpenSearchDashboards').mockReturnValue({
      services: {
        notifications: {
          toasts: {
            addDanger: addDangerMock,
            addSuccess: addSuccessMock,
          },
        },
      },
      overlays: {
        openModal: openModalMock,
      },
    });
    jest
      .spyOn(ModelVersion.prototype, 'load')
      .mockResolvedValue({ task_id: 'mock_task_id', status: 'deployed' });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should display success toast if model deployed successfully', async () => {
    // '2': REGISTERED, defined in msw handler
    const { result } = renderHook(() => useDeployment('2'));
    await result.current.deploy();
    await waitFor(() => {
      expect(addSuccessMock).toHaveBeenCalled();
    });
  });

  it('should display success toast if model undeployed successfully', async () => {
    // '3': DEPLOYED, defined in msw handler
    const { result } = renderHook(() => useDeployment('3'));
    await result.current.undeploy();
    await waitFor(() => {
      expect(addSuccessMock).toHaveBeenCalled();
    });
  });

  it('should display error toast if model deploy failed', async () => {
    server.use(
      rest.get(`${TASK_API_ENDPOINT}/:taskId`, (req, res, ctx) => {
        return res(
          ctx.json({
            model_id: '1',
            task_type: 'DEPLOY_MODEL',
            state: 'FAILED',
            create_time: 1685360406270,
            last_update_time: 1685360406471,
            worker_node: ['node-1'],
            error: 'model config error',
          })
        );
      })
    );
    // '2': REGISTERED, defined in msw handler
    const { result } = renderHook(() => useDeployment('2'));
    await result.current.deploy();
    await waitFor(() => {
      expect(addDangerMock).toHaveBeenCalled();
    });
  });

  it('should display error toast if undeploy failed', async () => {
    server.use(
      rest.post(`${MODEL_VERSION_UNLOAD_API_ENDPOINT}/:modelId`, (req, res, ctx) => {
        // Send invalid HTTP status code
        return res(ctx.status(500));
      })
    );

    // '3': DEPLOYED, defined in msw handler
    const { result } = renderHook(() => useDeployment('3'));
    await result.current.undeploy();

    await waitFor(() => {
      expect(addDangerMock).toHaveBeenCalled();
    });
  });

  it('should display error toast if trying to deploy a model which is already deployed', async () => {
    // '3': DEPLOYED, defined in msw handler
    const { result } = renderHook(() => useDeployment('3'));
    await result.current.deploy();
    await waitFor(() => {
      expect(addDangerMock).toHaveBeenCalled();
    });
  });

  it('should display error toast if trying to undeploy a model which is not deployed', async () => {
    const { result } = renderHook(() => useDeployment('2'));
    await result.current.undeploy();
    await waitFor(() => {
      expect(addDangerMock).toHaveBeenCalled();
    });
  });
});
