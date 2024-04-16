/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useContext } from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen, waitFor } from '../../../test/test_utils';
import { DataSourceTopNavMenu, DataSourceTopNavMenuProps } from '../data_source_top_nav_menu';
import { coreMock } from '../../../../../src/core/public/mocks';
import { DataSourceContext, DataSourceContextProvider } from '../../contexts';

function setup(options: Partial<DataSourceTopNavMenuProps> = {}) {
  const user = userEvent.setup({});
  const coreStart = coreMock.createStart();
  const DataSourceMenu = ({ componentConfig: { onSelectedDataSources } }) => (
    <div>
      <div>Data Source Menu</div>
      <div>
        <button
          onClick={() => {
            onSelectedDataSources([]);
          }}
          aria-label="invalidDataSource"
        >
          Invalid data source
        </button>
        <button
          onClick={() => {
            onSelectedDataSources([{ id: 'ds1', label: 'Data Source 1' }]);
          }}
          aria-label="validDataSource"
        >
          Valid data source
        </button>
      </div>
    </div>
  );

  const DataSourceConsumer = () => {
    const { dataSourceEnabled, selectedDataSourceOption } = useContext(DataSourceContext);

    return (
      <div>
        <input
          value={JSON.stringify(dataSourceEnabled)}
          aria-label="dataSourceEnabled"
          onChange={() => {}}
        />
        <input
          value={
            selectedDataSourceOption === undefined
              ? 'undefined'
              : JSON.stringify(selectedDataSourceOption)
          }
          aria-label="selectedDataSourceOption"
          onChange={() => {}}
        />
      </div>
    );
  };

  const renderResult = render(
    <>
      <DataSourceTopNavMenu
        notifications={coreStart.notifications}
        savedObjects={coreStart.savedObjects}
        dataSource={{
          dataSourceEnabled: true,
          noAuthenticationTypeEnabled: true,
          awsSigV4AuthEnabled: true,
          hideLocalCluster: false,
          usernamePasswordAuthEnabled: true,
        }}
        dataSourceManagement={{
          registerAuthenticationMethod: jest.fn(),
          ui: {
            DataSourceSelector: () => null,
            getDataSourceMenu: () => DataSourceMenu,
          },
        }}
        setActionMenu={jest.fn()}
        {...options}
      />
      <DataSourceConsumer />
    </>
  );
  return { user, renderResult };
}

describe('<DataSourceTopNavMenu />', () => {
  it('should not render data source menu when data source and data source management not defined', () => {
    setup({
      dataSource: undefined,
      dataSourceManagement: undefined,
    });
    expect(screen.queryByText('Data Source Menu')).not.toBeInTheDocument();
  });
  it('should not render data source menu when data source not defined', () => {
    setup({
      dataSource: undefined,
    });
    expect(screen.queryByText('Data Source Menu')).not.toBeInTheDocument();
  });
  it('should not render data source menu when data source management not defined', () => {
    setup({
      dataSourceManagement: undefined,
    });
    expect(screen.queryByText('Data Source Menu')).not.toBeInTheDocument();
  });
  it('should not render data source menu when data source not enabled', () => {
    setup({
      dataSource: {
        dataSourceEnabled: false,
        noAuthenticationTypeEnabled: false,
        awsSigV4AuthEnabled: false,
        hideLocalCluster: false,
        usernamePasswordAuthEnabled: false,
      },
    });
    expect(screen.queryByText('Data Source Menu')).not.toBeInTheDocument();
  });

  it('should render data source menu and data source context', () => {
    setup();
    expect(screen.getByText('Data Source Menu')).toBeInTheDocument();
    expect(screen.getByLabelText('dataSourceEnabled')).toHaveValue('true');
    expect(screen.getByLabelText('selectedDataSourceOption')).toHaveValue('null');
  });

  it('should set selected data source option to undefined', async () => {
    const { user } = setup();
    expect(screen.getByText('Data Source Menu')).toBeInTheDocument();
    await user.click(screen.getByLabelText('invalidDataSource'));
    await waitFor(() => {
      expect(screen.getByLabelText('selectedDataSourceOption')).toHaveValue('undefined');
    });
  });

  it('should set selected data source option to valid data source', async () => {
    const { user } = setup();
    expect(screen.getByText('Data Source Menu')).toBeInTheDocument();
    await user.click(screen.getByLabelText('validDataSource'));
    await waitFor(() => {
      expect(screen.getByLabelText('selectedDataSourceOption')).toHaveValue(
        JSON.stringify({ id: 'ds1', label: 'Data Source 1' })
      );
    });
  });
});
