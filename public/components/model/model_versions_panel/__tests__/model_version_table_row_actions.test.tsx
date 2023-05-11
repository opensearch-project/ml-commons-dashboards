/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import userEvent from '@testing-library/user-event';

import { render, screen, waitFor } from '../../../../../test/test_utils';
import { ModelVersionTableRowActions } from '../model_version_table_row_actions';
import { MODEL_STATE } from '../../../../../common';

describe('<ModelVersionTableRowActions />', () => {
  it('should render "actions icon" and "Delete" button after clicked', async () => {
    const user = userEvent.setup();
    render(<ModelVersionTableRowActions state={MODEL_STATE.uploading} id="1" />);

    expect(screen.getByLabelText('show actions')).toBeInTheDocument();
    await user.click(screen.getByLabelText('show actions'));

    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  it('should render "Upload new artifact" button for REGISTER_FAILED state', async () => {
    const user = userEvent.setup();
    render(<ModelVersionTableRowActions state={MODEL_STATE.registerFailed} id="1" />);
    await user.click(screen.getByLabelText('show actions'));

    expect(screen.getByText('Upload new artifact')).toBeInTheDocument();
  });

  it('should render "Deploy" button for REGISTERED and UNDEPLOYED state', async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <ModelVersionTableRowActions state={MODEL_STATE.uploaded} id="1" />
    );
    await user.click(screen.getByLabelText('show actions'));

    expect(screen.getByText('Deploy')).toBeInTheDocument();

    rerender(<ModelVersionTableRowActions state={MODEL_STATE.unloaded} id="1" />);
    expect(screen.getByText('Deploy')).toBeInTheDocument();
  });

  it('should render "Undeploy" button for DEPLOYED and PARTIALLY_DEPLOYED state', async () => {
    const user = userEvent.setup();
    const { rerender } = render(<ModelVersionTableRowActions state={MODEL_STATE.loaded} id="1" />);
    await user.click(screen.getByLabelText('show actions'));

    expect(screen.getByText('Undeploy')).toBeInTheDocument();

    rerender(<ModelVersionTableRowActions state={MODEL_STATE.partiallyLoaded} id="1" />);
    expect(screen.getByText('Undeploy')).toBeInTheDocument();
  });

  it('should call close popover after menuitem click', async () => {
    const user = userEvent.setup();
    render(<ModelVersionTableRowActions state={MODEL_STATE.loaded} id="1" />);

    await user.click(screen.getByLabelText('show actions'));
    await user.click(screen.getByText('Delete'));

    await waitFor(() => {
      expect(screen.queryByText('Delete')).toBeNull();
    });
  });
});
