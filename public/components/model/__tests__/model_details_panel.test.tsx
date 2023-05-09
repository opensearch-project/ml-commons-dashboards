/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import userEvent from '@testing-library/user-event';

import { act, render, screen, within } from '../../../../test/test_utils';
import { ModelDetailsPanel } from '../model_details_panel';

import * as PluginContext from '../../../../../../src/plugins/opensearch_dashboards_react/public';

// Cannot spyOn(PluginContext, 'useOpenSearchDashboards') directly as it results in error:
// TypeError: Cannot redefine property: useOpenSearchDashboards
// So we have to mock the entire module first as a workaround
jest.mock('../../../../../../src/plugins/opensearch_dashboards_react/public', () => {
  return {
    __esModule: true,
    ...jest.requireActual('../../../../../../src/plugins/opensearch_dashboards_react/public'),
  };
});

describe('<ModelDetailsPanel />', () => {
  it('should render edit button and name, description in read-only mode by default', () => {
    render(<ModelDetailsPanel id="1" name="model-1" description="model-1 description" />);

    expect(screen.getByText('Edit')).toBeInTheDocument();
    expect(screen.getByDisplayValue('model-1')).toBeInTheDocument();
    expect(screen.getByDisplayValue('model-1')).toHaveAttribute('readonly');
    expect(screen.getByText('model-1 description')).toBeInTheDocument();
    expect(screen.getByDisplayValue('model-1 description')).toHaveAttribute('readonly');
  });

  it('should turn edit mode on when edit button is clicked', async () => {
    render(<ModelDetailsPanel id="1" name="model-1" description="model-1 description" />);

    await userEvent.click(screen.getByText('Edit'));
    expect(screen.getByText('Cancel')).toBeInTheDocument();

    expect(screen.getByDisplayValue('model-1')).toBeInTheDocument();
    expect(screen.getByDisplayValue('model-1')).not.toHaveAttribute('readonly');
    expect(screen.getByText(/Use a unique name for the model./)).toBeInTheDocument();

    expect(screen.getByText('model-1 description')).toBeInTheDocument();
    expect(screen.getByDisplayValue('model-1 description')).not.toHaveAttribute('readonly');
  });

  it('should NOT allow type more than 80 characters and show 0 characters left for name', async () => {
    render(<ModelDetailsPanel id="1" name={'model-1'} />);

    const nameInput = screen.getByLabelText(/Name/);

    await userEvent.click(screen.getByText('Edit'));
    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, 'x'.repeat(81));
    expect((nameInput as HTMLInputElement).value).toHaveLength(80);
    expect(
      within(nameInput.closest('.euiFormRow')!).getByText(/0 characters left./)
    ).toBeInTheDocument();
  });

  it('should NOT allow input characters more than 200 and show 0 characters left for description', async () => {
    render(<ModelDetailsPanel id="1" name={'model-1'} />);

    const descriptionInput = screen.getByLabelText(/Description/);

    await userEvent.click(screen.getByText('Edit'));
    await userEvent.clear(descriptionInput);
    await userEvent.type(descriptionInput, 'x'.repeat(201));
    expect((descriptionInput as HTMLInputElement).value).toHaveLength(200);
    expect(
      within(descriptionInput.closest('.euiFormRow')!).getByText(/0 characters left./)
    ).toBeInTheDocument();
  });

  it('should show unsaved changes count, error count, discard changes and save button after name input value cleared', async () => {
    render(<ModelDetailsPanel id="1" name="model-1" description="model-1 description" />);

    await userEvent.click(screen.getByText('Edit'));
    await userEvent.clear(screen.getByDisplayValue('model-1'));

    expect(screen.getByText('1 error(s)')).toBeInTheDocument();
    expect(screen.getByText('1 unsaved change(s)')).toBeInTheDocument();
    expect(screen.getByText('Discard change(s)')).toBeInTheDocument();
    expect(screen.getByText('Save')).toBeInTheDocument();
  });

  it('should reset to default name description after discard changes button clicked', async () => {
    render(<ModelDetailsPanel id="1" name="model-1" />);

    const nameInput = screen.getByLabelText(/Name/);
    const descriptionInput = screen.getByLabelText(/Description/);

    await userEvent.click(screen.getByText('Edit'));
    await userEvent.type(nameInput, 'updated');
    await userEvent.type(descriptionInput, 'description of model-1');

    await userEvent.click(screen.getByText('Discard change(s)'));
    expect(nameInput).toHaveValue('model-1');
    expect(descriptionInput).toHaveValue('');
  });

  it('should show error callout after save button clicked', async () => {
    render(<ModelDetailsPanel id="1" name="model-1" />);

    await userEvent.click(screen.getByText('Edit'));
    await userEvent.clear(screen.getByDisplayValue('model-1'));
    await userEvent.click(screen.getByText('Save'));

    expect(screen.getByText('Address the following error(s) in the form')).toBeInTheDocument();
    expect(screen.getByText('Name: can not be empty')).toBeInTheDocument();
  });

  it('should call addSuccessToast after form submit successfully', async () => {
    const addSuccessMock = jest.fn();
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    jest.useFakeTimers();

    const opensearchDashboardsMock = jest
      .spyOn(PluginContext, 'useOpenSearchDashboards')
      .mockReturnValue({
        services: {
          notifications: {
            toasts: {
              addSuccess: addSuccessMock,
            },
          },
        },
      });

    render(<ModelDetailsPanel id="1" name="model-1" />);

    await user.click(screen.getByText('Edit'));
    await user.type(screen.getByDisplayValue('model-1'), 'updated');
    await user.click(screen.getByText('Save'));

    // TODO: Remove it after integrated real model update API
    await act(async () => {
      jest.advanceTimersByTime(2000);
    });

    expect(addSuccessMock).toHaveBeenCalledTimes(1);

    jest.useRealTimers();
    opensearchDashboardsMock.mockRestore();
  });
});
