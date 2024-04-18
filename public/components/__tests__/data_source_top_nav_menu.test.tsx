/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useContext } from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen, waitFor } from '../../../test/test_utils';
import { DataSourceTopNavMenu, DataSourceTopNavMenuProps } from '../data_source_top_nav_menu';
import { coreMock } from '../../../../../src/core/public/mocks';
import { DataSourceContext } from '../../contexts';

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
    const { selectedDataSourceOption } = useContext(DataSourceContext);

    return (
      <div>
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
  it('should not render data source menu when data source management not defined', () => {
    setup({
      dataSourceManagement: undefined,
    });
    expect(screen.queryByText('Data Source Menu')).not.toBeInTheDocument();
  });

  it('should render data source menu and data source context', () => {
    setup();
    expect(screen.getByText('Data Source Menu')).toBeInTheDocument();
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
