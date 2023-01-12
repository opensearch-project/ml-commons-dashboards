/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import userEvent from '@testing-library/user-event';
import React from 'react';

import { render, screen, within } from '../../../../test/test_utils';
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
    statusFilterOptions: [{ value: 'responding', checked: undefined }],
    reload: jest.fn(),
    searchByName: jest.fn(),
    searchByStatus: jest.fn(),
    updateDeployedModel: jest.fn(),
    resetSearch: jest.fn(),
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
    it('should render empty monitoring without filter and total count', () => {
      setup({
        pageStatus: 'empty',
        deployedModels: [],
        pagination: {
          currentPage: 1,
          pageSize: 15,
          totalRecords: 0,
        },
      });
      expect(screen.getByLabelText('no deployed models')).toBeInTheDocument();
      expect(
        screen.queryByText('Status', { selector: "[data-text='Status']" })
      ).not.toBeInTheDocument();
      expect(screen.queryByText('(0)')).not.toBeInTheDocument();
    });
    it('should render loading monitoring', () => {
      setup({
        pageStatus: 'loading',
        deployedModels: [],
        pagination: {
          currentPage: 1,
          pageSize: 15,
          totalRecords: 0,
        },
      });
      expect(screen.getByLabelText('loading models')).toBeInTheDocument();
    });
    it('should render reset filter monitoring', () => {
      setup({
        pageStatus: 'reset-filter',
        deployedModels: [],
        pagination: {
          currentPage: 1,
          pageSize: 15,
          totalRecords: 0,
        },
      });
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

  it('should call resetSearch after reset search click', async () => {
    const {
      finalMonitoringReturnValue: { resetSearch },
      user,
    } = setup({ pageStatus: 'reset-filter', deployedModels: [] });
    expect(screen.getByLabelText('no models results')).toBeInTheDocument();

    await user.click(screen.getByText('Reset search'));
    expect(resetSearch).toHaveBeenCalled();
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

  it('should display consistent status filter options and call searchByStatus after filter option clicked', async () => {
    jest.useRealTimers();
    const originalOffsetHeight = Object.getOwnPropertyDescriptor(
      HTMLElement.prototype,
      'offsetHeight'
    );
    const originalOffsetWidth = Object.getOwnPropertyDescriptor(
      HTMLElement.prototype,
      'offsetWidth'
    );
    Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
      configurable: true,
      value: 600,
    });
    Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
      configurable: true,
      value: 600,
    });

    const {
      finalMonitoringReturnValue: { searchByStatus },
    } = setup();

    await userEvent.click(screen.getByText('Status', { selector: "[data-text='Status']" }));
    const allStatusFilterOptions = within(
      screen.getByRole('listbox', { name: 'Status' })
    ).getAllByRole('option');
    expect(allStatusFilterOptions.length).toBe(1);
    expect(within(allStatusFilterOptions[0]).getByText('Responding')).toBeInTheDocument();

    expect(searchByStatus).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole('option', { name: 'Responding' }));
    expect(searchByStatus).not.toHaveBeenCalledWith([{ value: 'responding', checked: 'on' }]);

    jest.useFakeTimers();
    Object.defineProperty(
      HTMLElement.prototype,
      'offsetHeight',
      originalOffsetHeight as PropertyDescriptor
    );
    Object.defineProperty(
      HTMLElement.prototype,
      'offsetWidth',
      originalOffsetWidth as PropertyDescriptor
    );
  });
});
