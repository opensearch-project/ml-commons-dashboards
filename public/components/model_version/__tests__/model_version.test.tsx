/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { generatePath, Route } from 'react-router-dom';
import userEvent from '@testing-library/user-event';

import { ModelVersion } from '../model_version';
import { render, screen, waitFor, within, mockOffsetMethods } from '../../../../test/test_utils';
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

  it('should NOT allow to edit tags if version notes is edited', async () => {
    setup();

    const user = userEvent.setup();

    // wait for data loading finished
    await waitFor(() => {
      expect(screen.queryByTestId('modelVersionLoadingSpinner')).not.toBeInTheDocument();
      expect(screen.queryByTestId('ml-versionDetailsLoading')).not.toBeInTheDocument();
    });

    const editVersionNotesButton = within(
      screen.getByTestId('ml-versionInformationPanel')
    ).getByLabelText('edit version notes');

    await user.click(editVersionNotesButton);
    // version notes changed
    await user.type(screen.getByLabelText('Version notes'), 'test notes');

    // edit tags button should be disable as user can NOT edit notes and tags at the same time
    expect(
      within(screen.getByTestId('ml-versionTagPanel')).getByLabelText('edit tags')
    ).toBeDisabled();
  });

  it('should NOT allow to edit version notes if tags is edited', async () => {
    setup();

    const user = userEvent.setup();

    // wait for data loading finished
    await waitFor(() => {
      expect(screen.queryByTestId('modelVersionLoadingSpinner')).not.toBeInTheDocument();
      expect(screen.queryByTestId('ml-versionDetailsLoading')).not.toBeInTheDocument();
    });

    const editTagsButton = within(screen.getByTestId('ml-versionTagPanel')).getByLabelText(
      'edit tags'
    );
    // enable editing
    await user.click(editTagsButton);
    // add a new tag
    await user.click(screen.getByRole('button', { name: /add tag/i }));
    // version information edit button should be disabled
    expect(
      within(screen.getByTestId('ml-versionInformationPanel')).getByLabelText('edit version notes')
    ).toBeDisabled();
  });
});
