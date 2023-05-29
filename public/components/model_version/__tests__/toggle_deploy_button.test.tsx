/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { rest } from 'msw';

import { render, screen, waitFor } from '../../../../test/test_utils';
import userEvent from '@testing-library/user-event';
import * as PluginContext from '../../../../../../src/plugins/opensearch_dashboards_react/public';
import { ModelVersion } from '../../../../public/apis/model_version';
import { ToggleDeployButton, Props } from '../toggle_deploy_button';
import { MODEL_VERSION_STATE } from '../../../../common';
import { server } from '../../../../test/mocks/server';
import {
  MODEL_VERSION_UNLOAD_API_ENDPOINT,
  TASK_API_ENDPOINT,
} from '../../../../server/routes/constants';

// Cannot spyOn(PluginContext, 'useOpenSearchDashboards') directly as it results in error:
// TypeError: Cannot redefine property: useOpenSearchDashboards
// So we have to mock the entire module first as a workaround
jest.mock('../../../../../../src/plugins/opensearch_dashboards_react/public', () => {
  return {
    __esModule: true,
    ...jest.requireActual('../../../../../../src/plugins/opensearch_dashboards_react/public'),
  };
});

function setup(props: Partial<Props>) {
  render(
    <ToggleDeployButton
      modelState={MODEL_VERSION_STATE.registered}
      modelVersionId="model-version-id-1"
      modelName="test model name"
      modelVersion="1"
      onComplete={jest.fn()}
      onError={jest.fn()}
      {...props}
    />
  );
}

describe('<ToggleDeployButton />', () => {
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

  it('should render a "Deploy" button if model state is "REGISTERED"', () => {
    setup({ modelState: MODEL_VERSION_STATE.registered });
    expect(screen.getByLabelText('deploy model')).toBeInTheDocument();
  });

  it('should render a "Deploy" button if model state is "DEPLOY_FAILED"', () => {
    setup({ modelState: MODEL_VERSION_STATE.deployFailed });
    expect(screen.getByLabelText('deploy model')).toBeInTheDocument();
  });

  it('should render a "Deploy" button if model state is "UNDEPLOYED"', () => {
    setup({ modelState: MODEL_VERSION_STATE.undeployed });
    expect(screen.getByLabelText('deploy model')).toBeInTheDocument();
  });

  it('should render an "Undeploy" button if model state is "DEPLOYED"', () => {
    setup({ modelState: MODEL_VERSION_STATE.deployed });
    expect(screen.getByLabelText('undeploy model')).toBeInTheDocument();
  });

  it('should render an "Undeploy" button if model state is "PARTIALLY_DEPLOYED"', () => {
    setup({ modelState: MODEL_VERSION_STATE.partiallyDeployed });
    expect(screen.getByLabelText('undeploy model')).toBeInTheDocument();
  });

  it('should NOT render the button if model state is REGISTERING', () => {
    setup({ modelState: MODEL_VERSION_STATE.registering });
    expect(screen.queryByLabelText('undeploy model')).toBeFalsy();
    expect(screen.queryByLabelText('deploy model')).toBeFalsy();
  });

  it('should NOT render the button if model state is DEPLOYING', () => {
    setup({ modelState: MODEL_VERSION_STATE.deploying });
    expect(screen.queryByLabelText('undeploy model')).toBeFalsy();
    expect(screen.queryByLabelText('deploy model')).toBeFalsy();
  });

  it('should NOT render the button if model state is REGISTER_FAILED', () => {
    setup({ modelState: MODEL_VERSION_STATE.registerFailed });
    expect(screen.queryByLabelText('undeploy model')).toBeFalsy();
    expect(screen.queryByLabelText('deploy model')).toBeFalsy();
  });

  it('should display a confirmation dialog when click the "Deploy" button', async () => {
    const user = userEvent.setup();
    setup({
      modelState: MODEL_VERSION_STATE.registered,
      modelName: 'test model name',
      modelVersion: '1',
    });
    await user.click(screen.getByLabelText('deploy model'));
    expect(screen.queryByText('Deploy test model name version 1?')).toBeInTheDocument();
  });

  it('should display a confirmation dialog when click the "Undeploy" button', async () => {
    const user = userEvent.setup();
    setup({
      modelState: MODEL_VERSION_STATE.deployed,
      modelName: 'test model name',
      modelVersion: '1',
    });
    await user.click(screen.getByLabelText('undeploy model'));
    expect(screen.queryByText('Undeploy test model name version 1?')).toBeInTheDocument();
  });

  it('should display success toast if model deployed successfully', async () => {
    const user = userEvent.setup();
    setup({
      modelState: MODEL_VERSION_STATE.registered,
      modelName: 'test model name',
      modelVersion: '1',
    });
    // Click deploy button
    await user.click(screen.getByLabelText('deploy model'));
    // Click confirm button
    await user.click(screen.getByTestId('confirmModalConfirmButton'));

    expect(addSuccessMock).toHaveBeenCalled();
  });

  it('should display success toast if model undeployed successfully', async () => {
    const user = userEvent.setup();
    setup({
      modelState: MODEL_VERSION_STATE.deployed,
      modelName: 'test model name',
      modelVersion: '1',
    });
    // Click undeploy button
    await user.click(screen.getByLabelText('undeploy model'));
    // Click confirm button
    await user.click(screen.getByTestId('confirmModalConfirmButton'));

    expect(addSuccessMock).toHaveBeenCalled();
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
    const user = userEvent.setup();
    setup({
      modelState: MODEL_VERSION_STATE.registered,
      modelName: 'test model name',
      modelVersion: '1',
    });
    // Click deploy button
    await user.click(screen.getByLabelText('deploy model'));
    // Click confirm button
    await user.click(screen.getByTestId('confirmModalConfirmButton'));

    expect(addDangerMock).toHaveBeenCalled();
  });

  it('should display error toast if undeploy failed', async () => {
    server.use(
      rest.post(`${MODEL_VERSION_UNLOAD_API_ENDPOINT}/:modelId`, (req, res, ctx) => {
        // Send invalid HTTP status code
        return res(ctx.status(500));
      })
    );
    const user = userEvent.setup();
    setup({
      modelState: MODEL_VERSION_STATE.deployed,
      modelName: 'test model name',
      modelVersion: '1',
    });
    // Click deploy button
    await user.click(screen.getByLabelText('undeploy model'));
    // Click confirm button
    await user.click(screen.getByTestId('confirmModalConfirmButton'));

    expect(addDangerMock).toHaveBeenCalled();
  });
});
