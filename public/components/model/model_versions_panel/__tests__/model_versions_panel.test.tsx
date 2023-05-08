/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import userEvent from '@testing-library/user-event';

import { render, screen, waitFor, within } from '../../../../../test/test_utils';
import { Model } from '../../../../apis/model';
import { ModelVersionsPanel } from '../model_versions_panel';

describe('<ModelVersionsPanel />', () => {
  it(
    'should render version count, refresh button, filter and table by default',
    async () => {
      render(<ModelVersionsPanel groupId="1" />);

      expect(
        screen.getByPlaceholderText('Search by version number, or keyword')
      ).toBeInTheDocument();
      expect(screen.getByTitle('State')).toBeInTheDocument();
      expect(screen.getByTitle('Status')).toBeInTheDocument();
      expect(screen.getByTitle('Add tag filter')).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText('Search by version number, or keyword')
      ).toBeInTheDocument();
      expect(screen.getByText('Refresh')).toBeInTheDocument();

      await waitFor(() => {
        expect(
          screen.getByText((text, node) => {
            return text === 'Versions' && !!node?.childNodes[1]?.textContent?.includes('(3)');
          })
        ).toBeInTheDocument();
      });

      expect(
        within(
          within(screen.getByLabelText('Model versions')).getAllByRole('gridcell')[0]
        ).getByText('1.0.0')
      ).toBeInTheDocument();
    },
    10 * 1000
  );

  it(
    'should call model search API again after refresh button clicked',
    async () => {
      const searchMock = jest.spyOn(Model.prototype, 'search');

      render(<ModelVersionsPanel groupId="1" />);

      expect(searchMock).toHaveBeenCalledTimes(1);

      await userEvent.click(screen.getByText('Refresh'));
      expect(searchMock).toHaveBeenCalledTimes(2);

      searchMock.mockRestore();
    },
    10 * 1000
  );

  it(
    'should call model search with consistent state parameters after deployed state filter applied',
    async () => {
      const searchMock = jest.spyOn(Model.prototype, 'search');

      render(<ModelVersionsPanel groupId="1" />);

      await userEvent.click(screen.getByTitle('State'));
      await userEvent.click(screen.getByRole('option', { name: 'Deployed' }));

      await waitFor(() => {
        expect(searchMock).toHaveBeenLastCalledWith(
          expect.objectContaining({
            states: ['DEPLOYED', 'PARTIALLY_DEPLOYED'],
          })
        );
      });

      await userEvent.click(screen.getByRole('option', { name: 'Deployed' }));
      await userEvent.click(screen.getByRole('option', { name: 'Not deployed' }));
      await waitFor(() => {
        expect(searchMock).toHaveBeenLastCalledWith(
          expect.objectContaining({
            states: ['DEPLOYING', 'REGISTERING', 'REGISTERED', 'DEPLOY_FAILED', 'REGISTER_FAILED'],
          })
        );
      });

      searchMock.mockRestore();
    },
    10 * 10000
  );
});
