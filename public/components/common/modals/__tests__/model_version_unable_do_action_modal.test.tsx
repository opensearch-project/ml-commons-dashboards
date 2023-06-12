/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import userEvent from '@testing-library/user-event';

import { render, screen } from '../../../../../test/test_utils';
import { MODEL_VERSION_STATE } from '../../../../../common';
import { ModelVersionUnableDoActionModal } from '../model_version_unable_do_action_modal';

const setup = (
  options: { actionType: 'delete' | 'edit'; state: MODEL_VERSION_STATE } = {
    actionType: 'delete',
    state: MODEL_VERSION_STATE.registering,
  }
) => {
  const closeModalMock = jest.fn();
  render(
    <ModelVersionUnableDoActionModal
      id="1"
      name="model1"
      version="1.0"
      closeModal={closeModalMock}
      {...options}
    />
  );
  return {
    closeModalMock,
  };
};

describe('<ModelVersionUnableDoActionModal />', () => {
  it('should call closeModal after close button clicked', async () => {
    const { closeModalMock } = setup();

    expect(closeModalMock).not.toHaveBeenCalled();
    await userEvent.click(screen.getByText('Close'));
    expect(closeModalMock).toHaveBeenCalled();
  });
  describe('actionType=delete', () => {
    it('should display unable delete title', async () => {
      setup();

      expect(screen.getByText('Unable to delete')).toBeInTheDocument();
    });

    it('should display unable delete message for model uploading state', async () => {
      setup({ actionType: 'delete', state: MODEL_VERSION_STATE.registering });

      expect(
        screen.getByText(
          'This version is uploading. Wait for this version to complete uploading and then try again.'
        )
      ).toBeInTheDocument();
    });

    it('should display unable delete message for model deploying state', async () => {
      setup({ actionType: 'delete', state: MODEL_VERSION_STATE.deploying });

      expect(
        screen.getByText(
          /To delete this version, wait for it to complete deploying and then undeploy it on the.+page./
        )
      ).toBeInTheDocument();
    });

    it('should display unable delete message for model deployed state', async () => {
      setup({ actionType: 'delete', state: MODEL_VERSION_STATE.deployed });

      expect(
        screen.getByText(
          /This version is currently deployed. To delete this version, undeploy it on the.+page./
        )
      ).toBeInTheDocument();
    });
  });
  describe('actionType=edit', () => {
    it('should display unable edit title', async () => {
      setup({ actionType: 'edit', state: MODEL_VERSION_STATE.registering });

      expect(screen.getByText('Unable to edit')).toBeInTheDocument();
    });

    it('should display unable edit message for model uploading state', async () => {
      setup({ actionType: 'edit', state: MODEL_VERSION_STATE.registering });

      expect(
        screen.getByText('Wait for this version to complete uploading and then try again.')
      ).toBeInTheDocument();
    });

    it('should display unable edit message for model deploying state', async () => {
      setup({ actionType: 'edit', state: MODEL_VERSION_STATE.deploying });

      expect(
        screen.getByText(
          /To edit this version, wait for it to complete deploying and then undeploy it on the.+page./
        )
      ).toBeInTheDocument();
    });

    it('should display unable edit message for model deployed state', async () => {
      setup({ actionType: 'edit', state: MODEL_VERSION_STATE.deployed });

      expect(
        screen.getByText(
          /This version is currently deployed. To edit this version, undeploy it on the.+page./
        )
      ).toBeInTheDocument();
    });
  });
});
