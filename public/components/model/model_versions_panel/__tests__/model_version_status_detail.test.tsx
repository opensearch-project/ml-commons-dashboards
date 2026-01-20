/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import userEvent from '@testing-library/user-event';

import { render, screen, waitFor } from '../../../../../test/test_utils';
import { ModelVersionStatusDetail } from '../model_version_status_detail';
import { MODEL_VERSION_STATE } from '../../../../../common';

describe('<ModelVersionStatusDetail />', () => {
  it('should render "In progress..." and uploading tip', async () => {
    render(
      <ModelVersionStatusDetail
        id="1"
        name="model-1"
        version="1"
        state={MODEL_VERSION_STATE.registering}
        createdTime={1683276773541}
      />
    );

    expect(screen.getByText('In progress...')).toBeInTheDocument();
    expect(screen.getByText(/The model artifact for.*is uploading./)).toBeInTheDocument();
    expect(screen.getByText('model-1 version 1')).toHaveAttribute(
      'href',
      '/model-registry/model-version/1'
    );
  });

  it('should render "Success", deployment tip and deployed time ', async () => {
    render(
      <ModelVersionStatusDetail
        id="1"
        name="model-1"
        version="1"
        state={MODEL_VERSION_STATE.deployed}
        createdTime={1683276773541}
        lastDeployedTime={1683276773541}
      />
    );

    expect(screen.getByText('Success')).toBeInTheDocument();
    expect(screen.getByText(/.*deployed./)).toBeInTheDocument();
    expect(screen.getByText('model-1 version 1')).toHaveAttribute(
      'href',
      '/model-registry/model-version/1'
    );

    expect(screen.getByText('Deployed on:')).toBeInTheDocument();
    expect(screen.getByText('May 5, 2023 @ 08:52:53.541')).toBeInTheDocument();
  });

  it('should render "-" if state not supported', async () => {
    render(
      <ModelVersionStatusDetail
        id="1"
        name="model-1"
        version="1"
        createdTime={1683276773541}
        state={MODEL_VERSION_STATE.trained}
      />
    );

    expect(screen.getByText('-')).toBeInTheDocument();
  });

  it('should render "See full error" button for "loadFailed" state', async () => {
    render(
      <ModelVersionStatusDetail
        id="1"
        name="model-1"
        version="1.0.0"
        state={MODEL_VERSION_STATE.deployFailed}
        createdTime={1683276773541}
        lastDeployedTime={1683276773541}
      />
    );

    expect(screen.getByText('Error')).toBeInTheDocument();
    expect(screen.getByText(/.*deployment failed./)).toBeInTheDocument();
    expect(screen.getByText('Deployment failed on:')).toBeInTheDocument();
    expect(screen.getByText('See full error')).toBeInTheDocument();
  });

  it('should display error detail after "See full error" button clicked', async () => {
    const user = userEvent.setup();
    render(
      <ModelVersionStatusDetail
        id="1"
        name="model-1"
        version="1.0.0"
        state={MODEL_VERSION_STATE.registerFailed}
        createdTime={1683276773541}
      />
    );

    expect(screen.getByText('Error')).toBeInTheDocument();
    await user.hover(screen.getByText('Error'));
    await user.click(screen.getByText('See full error'));
    await waitFor(() => {
      expect(screen.getByText('The artifact url is in valid')).toBeInTheDocument();
    });
  });
});
