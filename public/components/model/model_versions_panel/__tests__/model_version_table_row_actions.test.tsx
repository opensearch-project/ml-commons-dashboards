/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import userEvent from '@testing-library/user-event';

import { render, screen, waitFor } from '../../../../../test/test_utils';
import { ModelVersionTableRowActions } from '../model_version_table_row_actions';
import { MODEL_VERSION_STATE } from '../../../../../common';

const setup = (state: MODEL_VERSION_STATE) => {
  return render(
    <ModelVersionTableRowActions
      id="1"
      name="model-1"
      version="1"
      state={state}
      onDeleted={jest.fn()}
    />
  );
};

describe('<ModelVersionTableRowActions />', () => {
  it('should render "actions icon" and "Delete" button after clicked', async () => {
    const user = userEvent.setup();
    setup(MODEL_VERSION_STATE.registering);

    expect(screen.getByLabelText('show actions')).toBeInTheDocument();
    await user.click(screen.getByLabelText('show actions'));

    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  it('should render "Upload new artifact" button for REGISTER_FAILED state', async () => {
    const user = userEvent.setup();
    setup(MODEL_VERSION_STATE.registerFailed);
    await user.click(screen.getByLabelText('show actions'));

    expect(screen.getByText('Upload new artifact')).toBeInTheDocument();
  });

  it('should render "Deploy" button for REGISTERED, DEPLOY_FAILED and UNDEPLOYED state', async () => {
    const user = userEvent.setup();
    const { rerender } = setup(MODEL_VERSION_STATE.registered);
    await user.click(screen.getByLabelText('show actions'));

    expect(screen.getByText('Deploy')).toBeInTheDocument();

    rerender(
      <ModelVersionTableRowActions
        state={MODEL_VERSION_STATE.undeployed}
        id="1"
        name="model-1"
        version="1"
        onDeleted={jest.fn()}
      />
    );
    expect(screen.getByText('Deploy')).toBeInTheDocument();

    rerender(
      <ModelVersionTableRowActions
        state={MODEL_VERSION_STATE.deployFailed}
        id="1"
        name="model-1"
        version="1"
        onDeleted={jest.fn()}
      />
    );
    expect(screen.getByText('Deploy')).toBeInTheDocument();
  });

  it('should render "Undeploy" button for DEPLOYED and PARTIALLY_DEPLOYED state', async () => {
    const user = userEvent.setup();
    const { rerender } = setup(MODEL_VERSION_STATE.deployed);
    await user.click(screen.getByLabelText('show actions'));

    expect(screen.getByText('Undeploy')).toBeInTheDocument();

    rerender(
      <ModelVersionTableRowActions
        state={MODEL_VERSION_STATE.partiallyDeployed}
        id="1"
        name="model-1"
        version="1"
        onDeleted={jest.fn()}
      />
    );
    expect(screen.getByText('Undeploy')).toBeInTheDocument();
  });

  it('should call close popover after menuitem click', async () => {
    const user = userEvent.setup();
    setup(MODEL_VERSION_STATE.deployed);

    await user.click(screen.getByLabelText('show actions'));
    await user.click(screen.getByText('Delete'));

    await waitFor(() => {
      expect(screen.queryByText('Delete')).toBeNull();
    });
  });

  it('should show deploy confirm modal after "Deploy" button clicked', async () => {
    const user = userEvent.setup();
    setup(MODEL_VERSION_STATE.registered);
    await user.click(screen.getByLabelText('show actions'));
    await user.click(screen.getByText('Deploy'));

    expect(screen.getByTestId('confirmModalTitleText')).toHaveTextContent(
      'Deploy model-1 version 1'
    );
    expect(screen.getByText('This version will begin deploying.')).toBeInTheDocument();
  });

  it('should hide deploy confirm modal after "Cancel" button clicked', async () => {
    const user = userEvent.setup();
    setup(MODEL_VERSION_STATE.registered);
    await user.click(screen.getByLabelText('show actions'));
    await user.click(screen.getByText('Deploy'));
    await user.click(screen.getByText('Cancel'));

    expect(screen.queryByText('This version will begin deploying.')).not.toBeInTheDocument();
  });

  it('should show undeploy confirm modal after "Deploy" button clicked', async () => {
    const user = userEvent.setup();
    setup(MODEL_VERSION_STATE.deployed);
    await user.click(screen.getByLabelText('show actions'));
    await user.click(screen.getByText('Undeploy'));

    expect(screen.getByTestId('confirmModalTitleText')).toHaveTextContent(
      'Undeploy model-1 version 1'
    );
    expect(
      screen.getByText('This version will be undeployed. You can deploy it again later.')
    ).toBeInTheDocument();
  });

  it('should hide undeploy confirm modal after "Cancel" button clicked', async () => {
    const user = userEvent.setup();
    setup(MODEL_VERSION_STATE.deployed);
    await user.click(screen.getByLabelText('show actions'));
    await user.click(screen.getByText('Undeploy'));
    await user.click(screen.getByText('Cancel'));

    expect(
      screen.queryByText('This version will be undeployed. You can deploy it again later.')
    ).not.toBeInTheDocument();
  });

  it('should show delete confirm modal after "Delete" button clicked', async () => {
    const user = userEvent.setup();
    setup(MODEL_VERSION_STATE.registered);
    await user.click(screen.getByLabelText('show actions'));
    await user.click(screen.getByText('Delete'));

    expect(screen.getByTestId('confirmModalTitleText')).toHaveTextContent(
      'Delete model-1 version 1?'
    );
  });

  it('should show unable to delete modal after "Delete" button clicked if state was registering', async () => {
    const user = userEvent.setup();
    setup(MODEL_VERSION_STATE.registering);
    await user.click(screen.getByLabelText('show actions'));
    await user.click(screen.getByText('Delete'));

    expect(screen.getByText('Unable to delete')).toBeInTheDocument();
  });
});
