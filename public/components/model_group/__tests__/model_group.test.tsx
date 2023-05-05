/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import userEvent from '@testing-library/user-event';

import { render, screen, waitFor, within } from '../../../../test/test_utils';
import { ModelGroup } from '../model_group';
import { routerPaths } from '../../../../common/router_paths';
import { Route, generatePath } from 'react-router-dom';

const setup = () => {
  const renderResult = render(
    <Route path={routerPaths.modelGroup}>
      <ModelGroup />
    </Route>,
    { route: generatePath(routerPaths.modelGroup, { id: '1' }) }
  );

  return {
    renderResult,
  };
};

describe('<ModelGroup />', () => {
  it('should display model name, action buttons, overview-card, tabs and tabpanel after data loaded', async () => {
    setup();

    await waitFor(() => {
      expect(screen.queryByTestId('model-group-loading-indicator')).toBeNull();
    });
    expect(screen.getByText('model1')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
    expect(screen.getByText('Register version')).toBeInTheDocument();
    expect(screen.queryByTestId('model-group-overview-card')).toBeInTheDocument();
    expect(screen.queryByTestId('model-group-overview-card')).toBeInTheDocument();
    expect(screen.queryByTestId('model-group-overview-card')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Versions' })).toHaveClass('euiTab-isSelected');
    expect(within(screen.getByRole('tabpanel')).getByText('Versions')).toBeInTheDocument();
  });

  it(
    'should display consistent tabs content after tab clicked',
    async () => {
      setup();

      await waitFor(() => {
        expect(screen.queryByTestId('model-group-loading-indicator')).toBeNull();
      });
      expect(screen.getByRole('tab', { name: 'Versions' })).toHaveClass('euiTab-isSelected');
      expect(within(screen.getByRole('tabpanel')).getByText('Versions')).toBeInTheDocument();

      await userEvent.click(screen.getByRole('tab', { name: 'Details' }));
      expect(screen.getByRole('tab', { name: 'Details' })).toHaveClass('euiTab-isSelected');
      expect(within(screen.getByRole('tabpanel')).getByText('Details')).toBeInTheDocument();

      await userEvent.click(screen.getByRole('tab', { name: 'Tags' }));
      expect(screen.getByRole('tab', { name: 'Tags' })).toHaveClass('euiTab-isSelected');
      expect(within(screen.getByRole('tabpanel')).getByText('Tags')).toBeInTheDocument();
    },
    10 * 1000
  );
});
