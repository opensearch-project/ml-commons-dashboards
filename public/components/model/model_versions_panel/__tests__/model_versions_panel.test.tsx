/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import userEvent from '@testing-library/user-event';

import { render, screen, waitFor, within } from '../../../../../test/test_utils';
import { Model } from '../../../../apis/model';
import { ModelVersionsPanel } from '../model_versions_panel';
import * as PluginContext from '../../../../../../../src/plugins/opensearch_dashboards_react/public';

jest.mock('../../../../../../../src/plugins/opensearch_dashboards_react/public', () => {
  return {
    __esModule: true,
    ...jest.requireActual('../../../../../../../src/plugins/opensearch_dashboards_react/public'),
  };
});

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
            return text === 'Versions' && !!node?.childNodes[1]?.textContent?.includes('(1)');
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
      const searchMock = jest.spyOn(Model.prototype, 'search').mockImplementation(async () => {
        return {
          data: [],
          total_models: 0,
        };
      });

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
            from: 0,
            size: 25,
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

  it('should render loading screen when calling model search API', async () => {
    const searchMock = jest
      .spyOn(Model.prototype, 'search')
      .mockImplementation(() => new Promise(() => {}));
    render(<ModelVersionsPanel groupId="1" />);

    expect(screen.getByText('Loading versions')).toBeInTheDocument();

    searchMock.mockRestore();
  });

  it('should render error screen and show error toast after call model search failed', async () => {
    const searchMock = jest.spyOn(Model.prototype, 'search').mockImplementation(async () => {
      throw new Error();
    });
    const dangerMock = jest.fn();
    const pluginMock = jest.spyOn(PluginContext, 'useOpenSearchDashboards').mockReturnValue({
      notifications: {
        toasts: {
          danger: dangerMock,
        },
      },
    });
    render(<ModelVersionsPanel groupId="1" />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load versions')).toBeInTheDocument();
      expect(dangerMock).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Failed to load data',
        })
      );
    });

    searchMock.mockRestore();
    pluginMock.mockRestore();
  });

  it('should render empty screen if model no versions', async () => {
    const searchMock = jest.spyOn(Model.prototype, 'search').mockImplementation(async () => {
      return {
        data: [],
        total_models: 0,
      };
    });

    render(<ModelVersionsPanel groupId="1" />);

    await waitFor(() => {
      expect(screen.getByText('Registered versions will appear here.')).toBeInTheDocument();
      expect(screen.getByText('Register new version')).toBeInTheDocument();
      expect(screen.getByText('Register new version').closest('a')).toHaveAttribute(
        'href',
        '/model-registry/register-model/1'
      );
      expect(screen.getByText('Read documentation')).toBeInTheDocument();
    });

    searchMock.mockRestore();
  });

  it('should render no-result screen and reset search button if no result for specific condition', async () => {
    render(<ModelVersionsPanel groupId="1" />);
    await waitFor(() => {
      expect(screen.getByTitle('Status')).toBeInTheDocument();
    });

    const searchMock = jest.spyOn(Model.prototype, 'search').mockImplementation(async () => {
      return {
        data: [],
        total_models: 0,
      };
    });
    await userEvent.click(screen.getByTitle('Status'));
    await userEvent.click(screen.getByRole('option', { name: 'In progress...' }));

    expect(
      screen.getByText(
        'There are no results for your search. Reset the search criteria to view registered versions.'
      )
    ).toBeInTheDocument();
    expect(screen.getByText('Reset search criteria')).toBeInTheDocument();

    searchMock.mockRestore();
  });

  it(
    'should call model search without filter condition after reset button clicked',
    async () => {
      render(<ModelVersionsPanel groupId="1" />);
      await waitFor(() => {
        expect(screen.getByTitle('Status')).toBeInTheDocument();
      });

      const searchMock = jest.spyOn(Model.prototype, 'search').mockImplementation(async () => {
        return {
          data: [],
          total_models: 0,
        };
      });
      await userEvent.click(screen.getByTitle('Status'));
      await userEvent.click(screen.getByRole('option', { name: 'In progress...' }));

      expect(searchMock).toHaveBeenCalledTimes(1);
      await userEvent.click(screen.getByText('Reset search criteria'));
      expect(searchMock).toHaveBeenCalledTimes(2);
      expect(searchMock).toHaveBeenCalledWith({
        from: 0,
        size: 25,
        // TODO: Change to model group id once parameter added
        ids: expect.any(Array),
      });

      searchMock.mockRestore();
    },
    10 * 1000
  );
});
