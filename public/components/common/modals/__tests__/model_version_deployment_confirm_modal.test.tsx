/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import userEvent from '@testing-library/user-event';

import { render, screen, waitFor } from '../../../../../test/test_utils';
import { ModelVersionDeploymentConfirmModal } from '../model_version_deployment_confirm_modal';
import * as Hooks from '../../../../hooks/use_deployment';

describe('<ModelVersionDeploymentConfirmModal />', () => {
  const deployMock = jest.fn().mockResolvedValue(undefined);
  const undeployMock = jest.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    jest
      .spyOn(Hooks, 'useDeployment')
      .mockReturnValue({ deploy: deployMock, undeploy: undeployMock });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

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

    it('should call deploy model after deploy button clicked', async () => {
      render(
        <ModelVersionDeploymentConfirmModal
          id="1"
          name="model-1"
          version="1"
          closeModal={jest.fn()}
          mode="deploy"
        />
      );

      expect(deployMock).not.toHaveBeenCalled();
      await userEvent.click(screen.getByRole('button', { name: 'Deploy' }));
      await waitFor(() => {
        expect(deployMock).toHaveBeenCalledTimes(1);
      });
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
      render(
        <ModelVersionDeploymentConfirmModal
          id="1"
          name="model-1"
          version="1"
          closeModal={jest.fn()}
          mode="undeploy"
        />
      );

      expect(undeployMock).not.toHaveBeenCalled();
      await userEvent.click(screen.getByRole('button', { name: 'Undeploy' }));
      await waitFor(() => {
        expect(undeployMock).toHaveBeenCalledTimes(1);
      });
    });
  });

  it('should call closeModal with canceled after cancel button clicked', async () => {
    const closeModalMock = jest.fn(() => {});
    render(
      <ModelVersionDeploymentConfirmModal
        id="1"
        name="model-1"
        version="1"
        closeModal={closeModalMock}
        mode="undeploy"
      />
    );

    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(closeModalMock).toHaveBeenCalledWith({ canceled: true, succeed: false, id: '1' });
  });

  it('should call closeModal with succeed equal true after undeploy button clicked and deploy complete', async () => {
    const closeModalMock = jest.fn(() => {});
    render(
      <ModelVersionDeploymentConfirmModal
        id="1"
        name="model-1"
        version="1"
        closeModal={closeModalMock}
        mode="undeploy"
      />
    );

    await userEvent.click(screen.getByRole('button', { name: 'Undeploy' }));

    await waitFor(() => {
      expect(undeployMock.mock.calls.length).toBeGreaterThan(0);
      expect(
        undeployMock.mock.calls[undeployMock.mock.calls.length - 1][0].onComplete
      ).not.toBeUndefined();
    });

    undeployMock.mock.calls[undeployMock.mock.calls.length - 1][0].onComplete();
    expect(closeModalMock).toHaveBeenCalledWith({ canceled: false, succeed: true, id: '1' });
  });

  it('should call closeModal with succeed equal false after undeploy button clicked and deploy complete', async () => {
    const closeModalMock = jest.fn(() => {});
    render(
      <ModelVersionDeploymentConfirmModal
        id="1"
        name="model-1"
        version="1"
        closeModal={closeModalMock}
        mode="undeploy"
      />
    );

    await userEvent.click(screen.getByRole('button', { name: 'Undeploy' }));

    await waitFor(() => {
      expect(undeployMock.mock.calls.length).toBeGreaterThan(0);
      expect(
        undeployMock.mock.calls[undeployMock.mock.calls.length - 1][0].onError
      ).not.toBeUndefined();
    });

    undeployMock.mock.calls[undeployMock.mock.calls.length - 1][0].onError();
    expect(closeModalMock).toHaveBeenCalledWith({ canceled: false, succeed: false, id: '1' });
  });
});
