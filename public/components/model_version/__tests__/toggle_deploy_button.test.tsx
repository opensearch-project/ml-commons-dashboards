/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

import { render, screen } from '../../../../test/test_utils';
import userEvent from '@testing-library/user-event';
import { ToggleDeployButton, Props } from '../toggle_deploy_button';
import { MODEL_VERSION_STATE } from '../../../../common';
import * as Hooks from '../../../hooks/use_deployment';

function setup(props: Partial<Props>) {
  render(
    <ToggleDeployButton
      modelState={MODEL_VERSION_STATE.registered}
      modelVersionId="2" // Model is REGISTERED
      modelName="test model name"
      modelVersion="1"
      onComplete={jest.fn()}
      {...props}
    />
  );
}

describe('<ToggleDeployButton />', () => {
  const deployMock = jest.fn().mockResolvedValue(undefined);
  const undeployMock = jest.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    jest
      .spyOn(Hooks, 'useDeployment')
      .mockReturnValue({ deploy: deployMock, undeploy: undeployMock });
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
    });
    await user.click(screen.getByLabelText('deploy model'));
    expect(screen.queryByText('Deploy test model name version 1?')).toBeInTheDocument();

    await user.click(screen.getByTestId('confirmModalConfirmButton'));
    expect(deployMock).toHaveBeenCalled();
  });

  it('should display a confirmation dialog when click the "Undeploy" button', async () => {
    const user = userEvent.setup();
    setup({
      modelState: MODEL_VERSION_STATE.deployed,
    });
    await user.click(screen.getByLabelText('undeploy model'));
    expect(screen.queryByText('Undeploy test model name version 1?')).toBeInTheDocument();
    await user.click(screen.getByTestId('confirmModalConfirmButton'));
    expect(undeployMock).toHaveBeenCalled();
  });
});
