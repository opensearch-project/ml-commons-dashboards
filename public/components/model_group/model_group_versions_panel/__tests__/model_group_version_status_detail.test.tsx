/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import userEvent from '@testing-library/user-event';

import { render, screen, waitFor } from '../../../../../test/test_utils';
import { ModelGroupVersionStatusDetail } from '../model_group_version_status_detail';
import { MODEL_STATE } from '../../../../../common';

describe('<ModelGroupVersionStatusDetail />', () => {
  it('should render "In progress...", uploading tip and upload initialized time ', async () => {
    render(
      <ModelGroupVersionStatusDetail
        id="1"
        name="model-1"
        version="1"
        state={MODEL_STATE.uploading}
        createdTime={1683276773541}
      />
    );

    expect(screen.getByText('In progress...')).toBeInTheDocument();
    expect(screen.getByText(/The model artifact for.*is uploading./)).toBeInTheDocument();
    expect(screen.getByText('model-1 version 1')).toHaveAttribute(
      'href',
      '/model-registry/model-version/1'
    );

    expect(screen.getByText('Upload initiated on:')).toBeInTheDocument();
    expect(screen.getByText('May 5, 2023 @ 08:52:53.541')).toBeInTheDocument();
  });

  it('should render "-" if state not supported', async () => {
    render(
      <ModelGroupVersionStatusDetail
        id="1"
        name="model-1"
        version="1"
        createdTime={1683276773541}
        state={MODEL_STATE.trained}
      />
    );

    expect(screen.getByText('-')).toBeInTheDocument();
  });

  it('should render "See full error" button for "loadFailed" state', async () => {
    render(
      <ModelGroupVersionStatusDetail
        id="1"
        name="model-1"
        version="1.0.0"
        state={MODEL_STATE.loadFailed}
        createdTime={1683276773541}
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
      <ModelGroupVersionStatusDetail
        id="1"
        name="model-1"
        version="1.0.0"
        state={MODEL_STATE.registerFailed}
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
