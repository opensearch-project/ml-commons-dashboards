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
  const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
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
  return { finalMonitoringReturnValue, user };
};

describe('<Monitoring />', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('pageStatus', () => {
    it('should render empty monitoring', () => {
      setup({ pageStatus: 'empty', deployedModels: [] });
      expect(screen.getByLabelText('no deployed models')).toBeInTheDocument();
    });
    it('should render loading monitoring', () => {
      setup({ pageStatus: 'loading', deployedModels: [] });
      expect(screen.getByLabelText('loading models')).toBeInTheDocument();
    });
    it('should render reset filter monitoring', () => {
      setup({ pageStatus: 'reset-filter', deployedModels: [] });
      expect(screen.getByLabelText('no models results')).toBeInTheDocument();
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
      user,
    } = setup();
    await user.click(screen.getByTestId('tableHeaderSortButton'));
    expect(handleTableChange).toHaveBeenCalledWith(
      expect.objectContaining({
        sort: { field: 'name', direction: 'desc' },
      })
    );

    await user.click(screen.getByTestId('tablePaginationPopoverButton'));
    await user.click(screen.getByTestId('tablePagination-50-rows'));
    expect(handleTableChange).toHaveBeenCalledWith(
      expect.objectContaining({
        pagination: { currentPage: 1, pageSize: 50 },
      })
    );
  });

  it('should call clearNameStateFilter after reset search click', async () => {
    const {
      finalMonitoringReturnValue: { clearNameStateFilter },
      user,
    } = setup({ pageStatus: 'reset-filter', deployedModels: [] });
    expect(screen.getByLabelText('no models results')).toBeInTheDocument();

    await user.click(screen.getByText('Reset search'));
    expect(clearNameStateFilter).toHaveBeenCalled();
  });

  it('should reload table data at 10s interval by default when starts auto refresh', async () => {
    const {
      finalMonitoringReturnValue: { reload },
      user,
    } = setup({ reload: jest.fn() });

    // Open auto refresh popover
    await user.click(screen.getByLabelText(/set refresh interval/i));

    // Starts auto refresh with default interval
    await user.click(screen.getByLabelText(/start refresh interval/i));
    expect(reload).not.toHaveBeenCalled();

    // Reload at the 1st time
    jest.advanceTimersByTime(10000);
    expect(reload).toHaveBeenCalled();

    // Reload at the 2nd time
    jest.advanceTimersByTime(10000);
    expect(reload).toHaveBeenCalledTimes(2);
  });

  it('should display total number of results', async () => {
    const {
      finalMonitoringReturnValue: { pagination },
    } = setup({});

    expect(screen.getByLabelText(/total number of results/i).textContent).toBe(
      `(${pagination?.totalRecords})`
    );
  });
});
