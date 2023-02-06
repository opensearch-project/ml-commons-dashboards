/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import userEvent from '@testing-library/user-event';
import React from 'react';

import { render, screen, waitFor, within } from '../../../../test/test_utils';
import { Monitoring } from '../index';
import * as useMonitoringExports from '../use_monitoring';
import { APIProvider } from '../../../apis/api_provider';

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
      totalPages: 7,
    },
    deployedModels: [
      {
        id: 'model-1-id',
        name: 'model 1 name',
        respondingNodesCount: 1,
        notRespondingNodesCount: 2,
        planningNodesCount: 3,
        planningWorkerNodes: ['node1', 'node2', 'node3'],
      },
      {
        id: 'model-2-id',
        name: 'model 2 name',
        respondingNodesCount: 3,
        notRespondingNodesCount: 0,
        planningNodesCount: 3,
        planningWorkerNodes: ['node1', 'node2', 'node3'],
      },
      {
        id: 'model-3-id',
        name: 'model 3 name',
        respondingNodesCount: 0,
        notRespondingNodesCount: 3,
        planningNodesCount: 3,
        planningWorkerNodes: ['node1', 'node2', 'node3'],
      },
    ],
    reload: jest.fn(),
    searchByNameOrId: jest.fn(),
    searchByStatus: jest.fn(),
    updateDeployedModel: jest.fn(),
    resetSearch: jest.fn(),
    handleTableChange: jest.fn(),
    ...monitoringReturnValue,
  } as ReturnType<typeof useMonitoringExports.useMonitoring>;
  jest.spyOn(useMonitoringExports, 'useMonitoring').mockReturnValue(finalMonitoringReturnValue);
  render(<Monitoring />);
  return { finalMonitoringReturnValue, user };
};

const mockOffsetMethods = () => {
  const originalOffsetHeight = Object.getOwnPropertyDescriptor(
    HTMLElement.prototype,
    'offsetHeight'
  );
  const originalOffsetWidth = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetWidth');
  Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
    configurable: true,
    value: 600,
  });
  Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
    configurable: true,
    value: 600,
  });
  return () => {
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
  };
};

describe('<Monitoring />', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    jest.clearAllMocks();
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
          totalPages: 0,
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
          totalPages: 0,
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
          totalPages: 0,
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
    await user.click(screen.getAllByTestId('tableHeaderSortButton')[0]);
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

  it('should call resetSearch and reset search input after reset search click', async () => {
    const {
      finalMonitoringReturnValue: { resetSearch },
      user,
    } = setup({
      pageStatus: 'reset-filter',
      deployedModels: [],
    });
    await user.type(screen.getByLabelText(/Search by name or ID/i), 'test model name');

    expect(screen.getByLabelText('no models results')).toBeInTheDocument();
    expect(screen.getByLabelText(/Search by name or ID/i)).toHaveValue('test model name');

    await user.click(screen.getByText('Reset search'));
    expect(resetSearch).toHaveBeenCalled();
    // Search input should get reset
    expect(screen.getByLabelText(/Search by name or ID/i)).toHaveValue('');
  });

  it('should search with user input', async () => {
    const mockSearchByNameOrId = jest.fn();
    const {
      finalMonitoringReturnValue: { searchByNameOrId },
      user,
    } = setup({
      pageStatus: 'reset-filter',
      deployedModels: [],
      searchByNameOrId: mockSearchByNameOrId,
    });
    await user.type(screen.getByLabelText(/Search by name or ID/i), 'test model name');
    await waitFor(() => expect(searchByNameOrId).toHaveBeenCalledWith('test model name'));
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
    const clearOffsetMethodsMock = mockOffsetMethods();

    const {
      finalMonitoringReturnValue: { searchByStatus },
      user,
    } = setup({});

    await user.click(screen.getByText('Status', { selector: "[data-text='Status']" }));
    const allStatusFilterOptions = within(
      screen.getByRole('listbox', { name: 'Status' })
    ).getAllByRole('option');

    // Model status filter only shows 3 selected status for filtering
    expect(allStatusFilterOptions.length).toBe(3);
    expect(within(allStatusFilterOptions[0]).getByText('Responding')).toBeInTheDocument();
    expect(within(allStatusFilterOptions[1]).getByText('Partially responding')).toBeInTheDocument();
    expect(within(allStatusFilterOptions[2]).getByText('Not responding')).toBeInTheDocument();

    expect(searchByStatus).not.toHaveBeenCalled();
    await user.click(screen.getByRole('option', { name: 'Responding' }));
    expect(searchByStatus).not.toHaveBeenCalledWith([{ value: 'responding', checked: 'on' }]);

    clearOffsetMethodsMock();
  });

  it('should show preview panel after view detail button clicked', async () => {
    const { user } = setup();
    await user.click(screen.getAllByRole('button', { name: 'view detail' })[0]);
    const previewPanel = screen.getByRole('dialog');
    expect(previewPanel).toBeInTheDocument();
    expect(within(previewPanel).getByText('model 1 name')).toBeInTheDocument();
  });

  it('should call reload after preview panel closed if model deployment status changed', async () => {
    // model deployment status is changed
    jest.spyOn(APIProvider.getAPI('profile'), 'getModel').mockResolvedValue({
      id: 'model-1-id',
      // responding: 2
      worker_nodes: ['node-1', 'node-2'],
      // not responding: 1
      not_worker_nodes: ['node-3'],
      // planning: 3
      target_worker_nodes: ['node-1', 'node-2', 'node-3'],
    });

    const {
      finalMonitoringReturnValue: { reload },
      user,
    } = setup();

    // click on first item: responding: 1, not responding: 2, planning: 3
    await user.click(screen.getAllByRole('button', { name: 'view detail' })[0]);
    await user.click(screen.getByLabelText('Close this dialog'));
    expect(reload).toHaveBeenCalled();
  });

  it('should NOT call reload after preview panel closed if model deployment status NOT changed', async () => {
    // model deployment status is NOT changed
    jest.spyOn(APIProvider.getAPI('profile'), 'getModel').mockResolvedValue({
      id: 'model-1-id',
      // responding: 1
      worker_nodes: ['node-1'],
      // not responding: 2
      not_worker_nodes: ['node-2', 'node-3'],
      // planning: 3
      target_worker_nodes: ['node-1', 'node-2', 'node-3'],
    });

    const {
      finalMonitoringReturnValue: { reload },
      user,
    } = setup();

    // click on first item: responding: 1, not responding: 2, planning: 3
    await user.click(screen.getAllByRole('button', { name: 'view detail' })[0]);
    await user.click(screen.getByLabelText('Close this dialog'));
    expect(reload).not.toHaveBeenCalled();
  });
});
