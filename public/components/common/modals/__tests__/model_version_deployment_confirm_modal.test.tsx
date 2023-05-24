/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import userEvent from '@testing-library/user-event';
import { EuiToast } from '@elastic/eui';

import { render, screen, waitFor } from '../../../../../test/test_utils';
import { ModelVersionDeploymentConfirmModal } from '../model_version_deployment_confirm_modal';
import { Model } from '../../../../apis/model';

import * as PluginContext from '../../../../../../../src/plugins/opensearch_dashboards_react/public';
import { MountWrapper } from '../../../../../../../src/core/public/utils';
import { MountPoint } from 'opensearch-dashboards/public';
import { OverlayModalOpenOptions } from 'src/core/public/overlays';

// Cannot spyOn(PluginContext, 'useOpenSearchDashboards') directly as it results in error:
// TypeError: Cannot redefine property: useOpenSearchDashboards
// So we have to mock the entire module first as a workaround
jest.mock('../../../../../../../src/plugins/opensearch_dashboards_react/public', () => {
  return {
    __esModule: true,
    ...jest.requireActual('../../../../../../../src/plugins/opensearch_dashboards_react/public'),
  };
});

const generateToastMock = () =>
  jest.fn((toastInput) => {
    render(
      <EuiToast
        title={
          typeof toastInput === 'string' ? (
            toastInput
          ) : typeof toastInput.title === 'string' || !toastInput.title ? (
            toastInput.title
          ) : (
            <MountWrapper mount={toastInput.title} />
          )
        }
      >
        {typeof toastInput !== 'string' &&
          (typeof toastInput.text !== 'string' && toastInput.text ? (
            <MountWrapper mount={toastInput.text} />
          ) : (
            toastInput.text
          ))}
      </EuiToast>
    );
  });

const mockAddDangerAndOverlay = () => {
  return jest.spyOn(PluginContext, 'useOpenSearchDashboards').mockReturnValue({
    services: {
      notifications: {
        toasts: {
          addDanger: generateToastMock(),
        },
      },
      overlays: {
        openModal: jest.fn((modelMountPoint: MountPoint, options?: OverlayModalOpenOptions) => {
          const { unmount } = render(<MountWrapper mount={modelMountPoint} />);
          return {
            onClose: Promise.resolve(),
            close: async () => {
              unmount();
            },
          };
        }),
      },
    },
  });
};

describe('<ModelVersionDeploymentConfirmModal />', () => {
  describe('model=deploy', () => {
    it('should render deploy title and confirm message', () => {
      render(
        <ModelVersionDeploymentConfirmModal
          id="1"
          name="model-1"
          version="1"
          closeModal={jest.fn()}
          mode="deploy"
        />
      );

      expect(screen.getByTestId('confirmModalTitleText')).toHaveTextContent(
        'Deploy model-1 version 1'
      );
      expect(screen.getByText('This version will begin deploying.')).toBeInTheDocument();
      expect(screen.getByText('model-1 version 1')).toHaveAttribute(
        'href',
        '/model-registry/model-version/1'
      );
    });

    it('should call model load after deploy button clicked', async () => {
      const modelLoadMock = jest
        .spyOn(Model.prototype, 'load')
        .mockReturnValue(Promise.resolve({ task_id: 'foo', status: 'succeeded' }));
      render(
        <ModelVersionDeploymentConfirmModal
          id="1"
          name="model-1"
          version="1"
          closeModal={jest.fn()}
          mode="deploy"
        />
      );

      expect(modelLoadMock).not.toHaveBeenCalled();
      await userEvent.click(screen.getByRole('button', { name: 'Deploy' }));
      expect(modelLoadMock).toHaveBeenCalledTimes(1);

      modelLoadMock.mockRestore();
    });

    it('should show error toast if model load throw error', async () => {
      const useOpenSearchDashboardsMock = mockAddDangerAndOverlay();
      const modelLoadMock = jest
        .spyOn(Model.prototype, 'load')
        .mockRejectedValue(new Error('error'));
      render(
        <ModelVersionDeploymentConfirmModal
          id="1"
          name="model-1"
          version="1"
          closeModal={jest.fn()}
          mode="deploy"
        />
      );

      await userEvent.click(screen.getByRole('button', { name: 'Deploy' }));

      expect(screen.getByText('deployment failed.')).toBeInTheDocument();
      expect(screen.getByText('See full error')).toBeInTheDocument();

      modelLoadMock.mockRestore();
      useOpenSearchDashboardsMock.mockRestore();
    });

    it('should show full error after "See full error" clicked', async () => {
      const useOpenSearchDashboardsMock = mockAddDangerAndOverlay();
      const modelLoadMock = jest
        .spyOn(Model.prototype, 'load')
        .mockRejectedValue(new Error('This is a full error message.'));
      render(
        <ModelVersionDeploymentConfirmModal
          id="1"
          name="model-1"
          version="1"
          closeModal={jest.fn()}
          mode="deploy"
        />
      );

      await userEvent.click(screen.getByRole('button', { name: 'Deploy' }));
      await userEvent.click(screen.getByText('See full error'));

      expect(screen.getByText('Error message:')).toBeInTheDocument();
      expect(screen.getByText('This is a full error message.')).toBeInTheDocument();

      modelLoadMock.mockRestore();
      useOpenSearchDashboardsMock.mockRestore();
    });

    it('should hide full error after close button clicked', async () => {
      const useOpenSearchDashboardsMock = mockAddDangerAndOverlay();
      const modelLoadMock = jest
        .spyOn(Model.prototype, 'load')
        .mockRejectedValue(new Error('This is a full error message.'));
      render(
        <ModelVersionDeploymentConfirmModal
          id="1"
          name="model-1"
          version="1"
          closeModal={jest.fn()}
          mode="deploy"
        />
      );

      await userEvent.click(screen.getByRole('button', { name: 'Deploy' }));
      await userEvent.click(screen.getByText('See full error'));
      await userEvent.click(screen.getByText('Close'));

      expect(screen.queryByText('This is a full error message.')).not.toBeInTheDocument();

      modelLoadMock.mockRestore();
      useOpenSearchDashboardsMock.mockRestore();
    });
  });

  describe('model=undeploy', () => {
    it('should render undeploy title and confirm message', () => {
      render(
        <ModelVersionDeploymentConfirmModal
          id="1"
          name="model-1"
          version="1"
          closeModal={jest.fn()}
          mode="undeploy"
        />
      );

      expect(screen.getByTestId('confirmModalTitleText')).toHaveTextContent(
        'Undeploy model-1 version 1'
      );
      expect(
        screen.getByText('This version will be undeployed. You can deploy it again later.')
      ).toBeInTheDocument();
      expect(screen.getByText('model-1 version 1')).toHaveAttribute(
        'href',
        '/model-registry/model-version/1'
      );
    });

    it('should call model unload after undeploy button clicked', async () => {
      const modelLoadMock = jest.spyOn(Model.prototype, 'unload').mockImplementation();
      render(
        <ModelVersionDeploymentConfirmModal
          id="1"
          name="model-1"
          version="1"
          closeModal={jest.fn()}
          mode="undeploy"
        />
      );

      expect(modelLoadMock).not.toHaveBeenCalled();
      await userEvent.click(screen.getByRole('button', { name: 'Undeploy' }));
      expect(modelLoadMock).toHaveBeenCalledTimes(1);

      modelLoadMock.mockRestore();
    });

    it('should show success toast after modal unload success', async () => {
      const useOpenSearchDashboardsMock = jest
        .spyOn(PluginContext, 'useOpenSearchDashboards')
        .mockReturnValue({
          services: {
            notifications: {
              toasts: {
                addSuccess: generateToastMock(),
              },
            },
          },
        });
      const modelLoadMock = jest.spyOn(Model.prototype, 'unload').mockImplementation();
      render(
        <ModelVersionDeploymentConfirmModal
          id="1"
          name="model-1"
          version="1"
          closeModal={jest.fn()}
          mode="undeploy"
        />
      );

      await userEvent.click(screen.getByRole('button', { name: 'Undeploy' }));

      await waitFor(() => {
        expect(screen.getByTestId('euiToastHeader')).toHaveTextContent(
          'Undeployed model-1 version 1'
        );
      });

      modelLoadMock.mockRestore();
      useOpenSearchDashboardsMock.mockRestore();
    });

    it('should show error toast if model unload throw error', async () => {
      const useOpenSearchDashboardsMock = mockAddDangerAndOverlay();
      const modelLoadMock = jest
        .spyOn(Model.prototype, 'unload')
        .mockRejectedValue(new Error('error'));
      render(
        <ModelVersionDeploymentConfirmModal
          id="1"
          name="model-1"
          version="1"
          closeModal={jest.fn()}
          mode="undeploy"
        />
      );

      await userEvent.click(screen.getByRole('button', { name: 'Undeploy' }));

      expect(screen.getByText('undeployment failed.')).toBeInTheDocument();
      expect(screen.getByText('See full error')).toBeInTheDocument();

      modelLoadMock.mockRestore();
      useOpenSearchDashboardsMock.mockRestore();
    });

    it('should show full error after "See full error" clicked', async () => {
      const useOpenSearchDashboardsMock = mockAddDangerAndOverlay();
      const modelLoadMock = jest
        .spyOn(Model.prototype, 'unload')
        .mockRejectedValue(new Error('This is a full error message.'));
      render(
        <ModelVersionDeploymentConfirmModal
          id="1"
          name="model-1"
          version="1"
          closeModal={jest.fn()}
          mode="undeploy"
        />
      );

      await userEvent.click(screen.getByRole('button', { name: 'Undeploy' }));
      await userEvent.click(screen.getByText('See full error'));

      expect(screen.getByText('Error message:')).toBeInTheDocument();
      expect(screen.getByText('This is a full error message.')).toBeInTheDocument();

      modelLoadMock.mockRestore();
      useOpenSearchDashboardsMock.mockRestore();
    });

    it('should hide full error after close button clicked', async () => {
      const useOpenSearchDashboardsMock = mockAddDangerAndOverlay();
      const modelLoadMock = jest
        .spyOn(Model.prototype, 'unload')
        .mockRejectedValue(new Error('This is a full error message.'));
      render(
        <ModelVersionDeploymentConfirmModal
          id="1"
          name="model-1"
          version="1"
          closeModal={jest.fn()}
          mode="undeploy"
        />
      );

      await userEvent.click(screen.getByRole('button', { name: 'Undeploy' }));
      await userEvent.click(screen.getByText('See full error'));
      await userEvent.click(screen.getByText('Close'));

      expect(screen.queryByText('This is a full error message.')).not.toBeInTheDocument();

      modelLoadMock.mockRestore();
      useOpenSearchDashboardsMock.mockRestore();
    });
  });
});
