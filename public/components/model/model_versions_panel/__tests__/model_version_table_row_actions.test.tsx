/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import userEvent from '@testing-library/user-event';

import { render, screen, waitFor } from '../../../../../test/test_utils';
import { ModelVersionTableRowActions } from '../model_version_table_row_actions';
import { MODEL_STATE } from '../../../../../common';

const setup = (state: MODEL_STATE) => {
  return render(<ModelVersionTableRowActions id="1" name="model-1" version="1" state={state} />);
};

describe('<ModelVersionTableRowActions />', () => {
  it('should render "actions icon" and "Delete" button after clicked', async () => {
    const user = userEvent.setup();
    setup(MODEL_STATE.uploading);

    expect(screen.getByLabelText('show actions')).toBeInTheDocument();
    await user.click(screen.getByLabelText('show actions'));

    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  it('should render "Upload new artifact" button for REGISTER_FAILED state', async () => {
    const user = userEvent.setup();
    setup(MODEL_STATE.registerFailed);
    await user.click(screen.getByLabelText('show actions'));

    expect(screen.getByText('Upload new artifact')).toBeInTheDocument();
  });

  it('should render "Deploy" button for REGISTERED, DEPLOY_FAILED and UNDEPLOYED state', async () => {
    const user = userEvent.setup();
    const { rerender } = setup(MODEL_STATE.uploaded);
    await user.click(screen.getByLabelText('show actions'));

    expect(screen.getByText('Deploy')).toBeInTheDocument();

    rerender(
      <ModelVersionTableRowActions state={MODEL_STATE.unloaded} id="1" name="model-1" version="1" />
    );
    expect(screen.getByText('Deploy')).toBeInTheDocument();

    rerender(
      <ModelVersionTableRowActions
        state={MODEL_STATE.loadFailed}
        id="1"
        name="model-1"
        version="1"
      />
    );
    expect(screen.getByText('Deploy')).toBeInTheDocument();
  });

  it('should render "Undeploy" button for DEPLOYED and PARTIALLY_DEPLOYED state', async () => {
    const user = userEvent.setup();
    const { rerender } = setup(MODEL_STATE.loaded);
    await user.click(screen.getByLabelText('show actions'));

    expect(screen.getByText('Undeploy')).toBeInTheDocument();

    rerender(
      <ModelVersionTableRowActions
        state={MODEL_STATE.partiallyLoaded}
        id="1"
        name="model-1"
        version="1"
      />
    );
    expect(screen.getByText('Undeploy')).toBeInTheDocument();
  });

  it('should call close popover after menuitem click', async () => {
    const user = userEvent.setup();
    setup(MODEL_STATE.loaded);

    await user.click(screen.getByLabelText('show actions'));
    await user.click(screen.getByText('Delete'));

    await waitFor(() => {
      expect(screen.queryByText('Delete')).toBeNull();
    });
  });

  it('should show deploy confirm modal after "Deploy" button clicked', async () => {
    const user = userEvent.setup();
    setup(MODEL_STATE.uploaded);
    await user.click(screen.getByLabelText('show actions'));
    await user.click(screen.getByText('Deploy'));

    expect(screen.getByTestId('confirmModalTitleText')).toHaveTextContent(
      'Deploy model-1 version 1'
    );
    expect(screen.getByText('This version will begin deploying.')).toBeInTheDocument();
  });

  it('should hide deploy confirm modal after "Cancel" button clicked', async () => {
    const user = userEvent.setup();
    setup(MODEL_STATE.uploaded);
    await user.click(screen.getByLabelText('show actions'));
    await user.click(screen.getByText('Deploy'));
    await user.click(screen.getByText('Cancel'));

    expect(screen.queryByText('This version will begin deploying.')).not.toBeInTheDocument();
  });

  it('should show undeploy confirm modal after "Deploy" button clicked', async () => {
    const user = userEvent.setup();
    setup(MODEL_STATE.loaded);
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
    setup(MODEL_STATE.loaded);
    await user.click(screen.getByLabelText('show actions'));
    await user.click(screen.getByText('Undeploy'));
    await user.click(screen.getByText('Cancel'));

    expect(
      screen.queryByText('This version will be undeployed. You can deploy it again later.')
    ).not.toBeInTheDocument();
  });
});
