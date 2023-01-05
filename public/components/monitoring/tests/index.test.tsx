/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import userEvent from '@testing-library/user-event';
import React from 'react';

import { render, screen } from '../../../../test/test_utils';
import { Monitoring } from '../index';
import * as useMonitoringExports from '../use_monitoring';

const setup = (
  monitoringReturnValue?: Partial<ReturnType<typeof useMonitoringExports.useMonitoring>>
) => {
  const finalMonitoringReturnValue = {
    params: {
      currentPage: 1,
      pageSize: 15,
      sort: { field: 'name', direction: 'asc' },
    },
    pageStatus: 'normal',
    pagination: {
      currentPage: 1,
      pageSize: 15,
      totalRecords: 100,
    },
    deployedModels: [
      {
        id: 'model-1-id',
        name: 'model 1 name',
        target_node_ids: ['node1', 'node2', 'node3'],
        not_deployed_node_ids: ['node1', 'node2'],
        deployed_node_ids: ['node3'],
      },
      {
        id: 'model-2-id',
        name: 'model 2 name',
        target_node_ids: ['node1', 'node2', 'node3'],
        not_deployed_node_ids: [],
        deployed_node_ids: ['node1', 'node2', 'node3'],
      },
      {
        id: 'model-3-id',
        name: 'model 3 name',
        target_node_ids: ['node1', 'node2', 'node3'],
        not_deployed_node_ids: ['node1', 'node2', 'node3'],
        deployed_node_ids: [],
      },
    ],
    reload: jest.fn(),
    searchByName: jest.fn(),
    searchByState: jest.fn(),
    updateDeployedModel: jest.fn(),
    clearNameStateFilter: jest.fn(),
    handleTableChange: jest.fn(),
    ...monitoringReturnValue,
  } as ReturnType<typeof useMonitoringExports.useMonitoring>;
  jest.spyOn(useMonitoringExports, 'useMonitoring').mockReturnValueOnce(finalMonitoringReturnValue);

  render(<Monitoring />);
  return { finalMonitoringReturnValue };
};

describe('<Monitoring />', () => {
  describe('pageStatus', () => {
    it('should render empty monitoring', () => {
      setup({ pageStatus: 'empty', deployedModels: [] });
      expect(screen.getByTestId('table-empty-prompt')).toBeInTheDocument();
    });
    it('should render loading monitoring', () => {
      setup({ pageStatus: 'loading', deployedModels: [] });
      expect(screen.getByTestId('table-loading-prompt')).toBeInTheDocument();
    });
    it('should render reset filter monitoring', () => {
      setup({ pageStatus: 'reset-filter', deployedModels: [] });
      expect(screen.getByTestId('table-no-result-prompt')).toBeInTheDocument();
    });
    it('should render normal monitoring', () => {
      setup();
      expect(screen.getByText('model-1-id')).toBeInTheDocument();
      expect(screen.getByText('model 2 name')).toBeInTheDocument();
      expect(screen.getByText('model-3-id')).toBeInTheDocument();
    });
  });

  it('should call handleTableChange with consistent params after Name column click or page change', async () => {
    const {
      finalMonitoringReturnValue: { handleTableChange },
    } = setup();
    await userEvent.click(screen.getByTestId('tableHeaderSortButton'));
    expect(handleTableChange).toHaveBeenCalledWith(
      expect.objectContaining({
        sort: { field: 'name', direction: 'desc' },
      })
    );

    await userEvent.click(screen.getByTestId('tablePaginationPopoverButton'));
    await userEvent.click(screen.getByTestId('tablePagination-50-rows'));
    expect(handleTableChange).toHaveBeenCalledWith(
      expect.objectContaining({
        pagination: { currentPage: 1, pageSize: 50 },
      })
    );
  });

  it('should call clearNameStateFilter after reset search click', async () => {
    const {
      finalMonitoringReturnValue: { clearNameStateFilter },
    } = setup({ pageStatus: 'reset-filter', deployedModels: [] });
    expect(screen.getByTestId('table-no-result-prompt')).toBeInTheDocument();

    await userEvent.click(screen.getByText('Reset search'));
    expect(clearNameStateFilter).toHaveBeenCalled();
  });
});
