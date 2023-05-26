/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import userEvent from '@testing-library/user-event';

import { render, screen, waitFor, act } from '../../../../../test/test_utils';
import { mockUseOpenSearchDashboards } from '../../../../../test/mock_opensearch_dashboards_react';
import { ModelVersion } from '../../../../apis/model_version';
import { ModelVersionDeleteConfirmModal } from '../model_version_delete_confirm_modal';
const setup = () => {
  const closeModalMock = jest.fn();
  const renderResult = render(
    <ModelVersionDeleteConfirmModal id="1" name="model1" version="1" closeModal={closeModalMock} />
  );
  return {
    renderResult,
    closeModalMock,
  };
};

describe('<ModelVersionDeleteConfirmModal />', () => {
  it('should render title, confirm tip, cancel and delete button by default', () => {
    setup();

    expect(screen.getByTestId('confirmModalTitleText')).toHaveTextContent(
      'Delete model1 version 1?'
    );
    expect(screen.getByLabelText('Type model1 version 1 to confirm.')).toBeInTheDocument();
    expect(screen.getByText('Cancel').closest('button')).toBeInTheDocument();
    expect(screen.getByText('Delete version').closest('button')).toBeInTheDocument();
  });

  it('should call closeModal with false when cancel button is clicked', async () => {
    const { closeModalMock } = setup();

    expect(closeModalMock).not.toHaveBeenCalled();
    await userEvent.click(screen.getByText('Cancel'));
    expect(closeModalMock).toHaveBeenCalledWith(false);
  });

  it('should call model version delete API after confirm text typed and delete button clicked', async () => {
    const modelDeleteMock = jest.spyOn(ModelVersion.prototype, 'delete').mockResolvedValue({});
    setup();

    await userEvent.type(screen.getByLabelText('confirm text input'), 'model1 version 1');

    expect(modelDeleteMock).not.toHaveBeenCalled();
    await userEvent.click(screen.getByText('Delete version'));
    expect(modelDeleteMock).toHaveBeenCalledWith('1');

    modelDeleteMock.mockRestore();
  });

  it('should show delete success toast and call closeModal with true after delete success and can not be searched', async () => {
    const modelDeleteMock = jest.spyOn(ModelVersion.prototype, 'delete').mockResolvedValue({});
    const modelSearchMock = jest
      .spyOn(ModelVersion.prototype, 'search')
      .mockResolvedValue({ data: [], total_model_versions: 0 });
    const openSearchDashboardsMock = mockUseOpenSearchDashboards();
    const { closeModalMock } = setup();

    await userEvent.type(screen.getByLabelText('confirm text input'), 'model1 version 1');

    expect(closeModalMock).not.toHaveBeenCalled();
    await userEvent.click(screen.getByText('Delete version'));
    await waitFor(() => {
      expect(screen.getByTestId('euiToastHeader')).toHaveTextContent(
        'model1 version 1 has been deleted'
      );
    });
    expect(closeModalMock).toHaveBeenCalledWith(true);

    modelDeleteMock.mockRestore();
    modelSearchMock.mockRestore();
    openSearchDashboardsMock.mockRestore();
  });

  it('should show unable to delete toast and call closeModal with false after delete failed', async () => {
    const modelDeleteMock = jest
      .spyOn(ModelVersion.prototype, 'delete')
      .mockRejectedValue(new Error());
    const openSearchDashboardsMock = mockUseOpenSearchDashboards();
    const { closeModalMock } = setup();

    await userEvent.type(screen.getByLabelText('confirm text input'), 'model1 version 1');

    expect(closeModalMock).not.toHaveBeenCalled();
    await userEvent.click(screen.getByText('Delete version'));
    expect(screen.getByTestId('euiToastHeader')).toHaveTextContent(
      'Unable to delete model1 version 1'
    );
    expect(closeModalMock).toHaveBeenCalledWith(false);

    modelDeleteMock.mockRestore();
    openSearchDashboardsMock.mockRestore();
  });

  it('should call closeModal with false after delete success and still can be searched', async () => {
    jest.useFakeTimers();

    const modelDeleteMock = jest.spyOn(ModelVersion.prototype, 'delete').mockResolvedValue({});
    const modelSearchMock = jest
      .spyOn(ModelVersion.prototype, 'search')
      .mockResolvedValue({ data: [], total_model_versions: 1 });

    const { closeModalMock } = setup();
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    await user.type(screen.getByLabelText('confirm text input'), 'model1 version 1');
    await user.click(screen.getByText('Delete version'));

    expect(closeModalMock).not.toHaveBeenCalled();

    for (let i = 0; i < 200; i++) {
      await act(async () => {
        jest.advanceTimersByTime(300);
      });
    }

    expect(closeModalMock).toHaveBeenCalledWith(false);

    modelDeleteMock.mockRestore();
    modelSearchMock.mockRestore();

    jest.useRealTimers();
  });

  it('should not call search API anymore after modal unmount', async () => {
    jest.useFakeTimers();

    const modelDeleteMock = jest.spyOn(ModelVersion.prototype, 'delete').mockResolvedValue({});
    const modelSearchMock = jest
      .spyOn(ModelVersion.prototype, 'search')
      .mockResolvedValue({ data: [], total_model_versions: 1 });

    const { renderResult } = setup();
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    await user.type(screen.getByLabelText('confirm text input'), 'model1 version 1');
    await user.click(screen.getByText('Delete version'));

    for (let i = 0; i < 10; i++) {
      await act(async () => {
        jest.advanceTimersByTime(300);
      });
    }

    modelSearchMock.mockClear();
    renderResult.unmount();
    for (let i = 0; i < 10; i++) {
      await act(async () => {
        jest.advanceTimersByTime(300);
      });
    }
    expect(modelSearchMock).not.toHaveBeenCalled();

    modelDeleteMock.mockRestore();
    modelSearchMock.mockRestore();

    jest.useRealTimers();
  });
});
