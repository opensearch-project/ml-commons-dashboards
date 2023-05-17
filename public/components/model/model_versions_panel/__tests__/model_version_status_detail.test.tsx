/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import userEvent from '@testing-library/user-event';

import { render, screen, waitFor } from '../../../../../test/test_utils';
import { ModelVersionStatusDetail } from '../model_version_status_detail';
import { MODEL_STATE } from '../../../../../common';

import * as PluginContext from '../../../../../../../src/plugins/opensearch_dashboards_react/public';

// Cannot spyOn(PluginContext, 'useOpenSearchDashboards') directly as it results in error:
// TypeError: Cannot redefine property: useOpenSearchDashboards
// So we have to mock the entire module first as a workaround
jest.mock('../../../../../../../src/plugins/opensearch_dashboards_react/public', () => {
  return {
    __esModule: true,
    ...jest.requireActual('../../../../../../../src/plugins/opensearch_dashboards_react/public'),
  };
});

describe('<ModelVersionStatusDetail />', () => {
  beforeAll(() => {
    jest.spyOn(PluginContext, 'useOpenSearchDashboards').mockReturnValue({
      services: {
        uiSettings: {
          get: () => 'MMM D, yyyy @ HH:mm:ss.SSS',
        },
      },
    });
  });

  afterAll(() => {
    jest.spyOn(PluginContext, 'useOpenSearchDashboards').mockRestore();
  });

  it('should render "In progress...", uploading tip and upload initialized time ', async () => {
    render(
      <ModelVersionStatusDetail
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
      <ModelVersionStatusDetail
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
      <ModelVersionStatusDetail
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
      <ModelVersionStatusDetail
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
