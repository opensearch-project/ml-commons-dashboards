/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import userEvent from '@testing-library/user-event';
import * as euiExports from '@elastic/eui';

import { render, screen, waitFor } from '../../../../../test/test_utils';
import { ModelVersionTableRowActions } from '../model_version_table_row_actions';
import { MODEL_STATE } from '../../../../../common';

jest.mock('@elastic/eui', () => {
  return {
    __esModule: true,
    ...jest.requireActual('@elastic/eui'),
  };
});

describe('<ModelVersionTableRowActions />', () => {
  it('should render actions icon and "Copy ID" and "Delete" button after clicked', async () => {
    const user = userEvent.setup();
    render(<ModelVersionTableRowActions state={MODEL_STATE.uploading} id="1" />);

    expect(screen.getByLabelText('show actions')).toBeInTheDocument();
    await user.click(screen.getByLabelText('show actions'));

    expect(screen.getByText('Copy ID')).toBeInTheDocument();
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

  it('should call copyToClipboard with "1" after "Copy ID" button clicked', async () => {
    const copyToClipboardMock = jest
      .spyOn(euiExports, 'copyToClipboard')
      .mockImplementation(jest.fn());
    const user = userEvent.setup();
    render(<ModelVersionTableRowActions state={MODEL_STATE.loaded} id="1" />);

    await user.click(screen.getByLabelText('show actions'));

    expect(copyToClipboardMock).not.toHaveBeenCalled();
    await user.click(screen.getByText('Copy ID'));
    expect(copyToClipboardMock).toHaveBeenCalledWith('1');

    copyToClipboardMock.mockRestore();
  });
});
