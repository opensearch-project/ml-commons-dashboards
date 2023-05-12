/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { generatePath, Route } from 'react-router-dom';
import userEvent from '@testing-library/user-event';

import { ModelVersion } from '../model_version';
import { render, screen, waitFor, mockOffsetMethods } from '../../../../test/test_utils';
import { routerPaths } from '../../../../common/router_paths';

const setup = () =>
  render(
    <Route path={routerPaths.modelVersion}>
      <ModelVersion />
    </Route>,
    { route: generatePath(routerPaths.modelVersion, { id: '1' }) }
  );

describe('<ModelVersion />', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should display consistent model name and version', async () => {
    setup();

    await waitFor(() => {
      expect(screen.getByText('model1')).toBeInTheDocument();
      expect(screen.getByText('v1.0.0')).toBeInTheDocument();
    });
  });

  it('should display loading screen during Model.getOne calling', async () => {
    setup();

    expect(screen.getByTestId('modelVersionLoadingSpinner')).toBeInTheDocument();
    expect(screen.queryAllByTestId('ml-versionDetailsLoading')).toBeTruthy();

    await waitFor(() => {
      expect(screen.queryByTestId('modelVersionLoadingSpinner')).not.toBeInTheDocument();
      expect(screen.queryByTestId('ml-versionDetailsLoading')).not.toBeInTheDocument();
    });
  });

  it('should display v1.0.1 and update location.pathname after version selected', async () => {
    const mockReset = mockOffsetMethods();
    const user = userEvent.setup();

    setup();

    await waitFor(() => {
      expect(screen.getByText('v1.0.0')).toBeInTheDocument();
    });
    await user.click(screen.getByText('v1.0.0'));

    await user.click(screen.getByText('1.0.1'));

    await waitFor(() => {
      expect(screen.getByText('v1.0.1')).toBeInTheDocument();
    });
    expect(location.pathname).toBe('/model-registry/model-version/4');

    mockReset();
  });
});
