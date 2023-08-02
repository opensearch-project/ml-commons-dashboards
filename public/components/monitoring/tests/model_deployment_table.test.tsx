/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import userEvent from '@testing-library/user-event';
import React from 'react';

import { render, screen, within } from '../../../../test/test_utils';
import { ModelDeploymentTableProps, ModelDeploymentTable } from '../model_deployment_table';

const setup = (props?: Partial<ModelDeploymentTableProps>) => {
  const finalProps = {
    items: [
      {
        id: 'model-1-id',
        name: 'model 1 name',
        respondingNodesCount: 1,
        notRespondingNodesCount: 2,
        planningNodesCount: 3,
        planningWorkerNodes: [],
        source: 'Local',
      },
      {
        id: 'model-2-id',
        name: 'model 2 name',
        respondingNodesCount: 3,
        notRespondingNodesCount: 0,
        planningNodesCount: 3,
        planningWorkerNodes: [],
        source: 'Local',
      },
      {
        id: 'model-3-id',
        name: 'model 3 name',
        respondingNodesCount: 0,
        notRespondingNodesCount: 3,
        planningNodesCount: 3,
        planningWorkerNodes: [],
        source: 'External',
      },
    ],
    pagination: { currentPage: 1, pageSize: 10, totalRecords: 100 },
    sort: { field: 'name' as const, direction: 'asc' as const },
    onChange: jest.fn(),
    ...props,
  };
  const result = render(<ModelDeploymentTable {...finalProps} />);
  return {
    result,
    finalProps,
  };
};

describe('<DeployedModelTable />', () => {
  it('should ONLY render an empty screen without the table if loading was completed but no data was loaded', () => {
    setup({
      items: [],
      noTable: true,
      loading: false,
    });
    expect(screen.getByRole('link')).toBeInTheDocument();
    expect(screen.getByRole('link').getAttribute('href')).toEqual(
      'https://opensearch.org/docs/latest/ml-commons-plugin/ml-dashboard/'
    );
    expect(screen.queryByRole('columnheader')).not.toBeInTheDocument();
  });

  it('should render no result screen and call onResetSearchClick if loading was completed but no data was loaded', async () => {
    const onResetSearchClickMock = jest.fn();
    setup({
      items: [],
      noTable: false,
      loading: false,
      onResetSearchClick: onResetSearchClickMock,
    });
    expect(screen.getByText('Reset search')).toBeInTheDocument();
    expect(screen.getAllByRole('columnheader').length).toBeGreaterThan(0);

    expect(onResetSearchClickMock).not.toHaveBeenCalled();
    await userEvent.click(screen.getByText('Reset search'));
    expect(onResetSearchClickMock).toHaveBeenCalled();
  });

  it('should render loading screen if data is loading', () => {
    setup({
      items: [],
      noTable: false,
      loading: true,
    });
    expect(screen.getByText('Loading deployed models...')).toBeInTheDocument();
  });

  describe('table cell content', () => {
    it('should render name at first column', () => {
      const columnIndex = 0;
      setup();
      const header = screen.getAllByRole('columnheader')[columnIndex];
      const columnContent = header
        .closest('table')
        ?.querySelectorAll(`tbody tr td:nth-child(${columnIndex + 1})`);
      expect(within(header).getByText('Name')).toBeInTheDocument();
      expect(columnContent?.length).toBe(3);
      const cells = columnContent!;
      expect(within(cells[0] as HTMLElement).getByText('model 1 name')).toBeInTheDocument();
      expect(within(cells[1] as HTMLElement).getByText('model 2 name')).toBeInTheDocument();
      expect(within(cells[2] as HTMLElement).getByText('model 3 name')).toBeInTheDocument();
    });

    it('should render status at second column', () => {
      const columnIndex = 1;
      setup();
      const header = screen.getAllByRole('columnheader')[columnIndex];
      const columnContent = header
        .closest('table')
        ?.querySelectorAll(`tbody tr td:nth-child(${columnIndex + 1})`);
      expect(within(header).getByText('Status')).toBeInTheDocument();
      expect(columnContent?.length).toBe(3);
      const cells = columnContent!;
      expect(within(cells[0] as HTMLElement).getByText('Partially responding')).toBeInTheDocument();
      expect(within(cells[0] as HTMLElement).getByText('on 1 of 3 nodes')).toBeInTheDocument();
      expect(within(cells[1] as HTMLElement).getByText('Responding')).toBeInTheDocument();
      expect(within(cells[1] as HTMLElement).getByText('on 3 of 3 nodes')).toBeInTheDocument();
      expect(within(cells[2] as HTMLElement).getByText('Not responding')).toBeInTheDocument();
      expect(within(cells[2] as HTMLElement).getByText('on 3 of 3 nodes')).toBeInTheDocument();
    });

    it('should display source name at third column', () => {
      const columnIndex = 2;
      setup();
      const header = screen.getAllByRole('columnheader')[columnIndex];
      const columnContent = header
        .closest('table')
        ?.querySelectorAll(`tbody tr td:nth-child(${columnIndex + 1})`);
      expect(within(header).getByText('Source')).toBeInTheDocument();
      expect(columnContent?.length).toBe(3);
      const cells = columnContent!;
      expect(within(cells[0] as HTMLElement).getByText('Local')).toBeInTheDocument();
      expect(within(cells[1] as HTMLElement).getByText('Local')).toBeInTheDocument();
      expect(within(cells[2] as HTMLElement).getByText('External')).toBeInTheDocument();
    });

    it('should render Model ID at forth column and copy to clipboard after text clicked', async () => {
      const execCommandOrigin = document.execCommand;
      document.execCommand = jest.fn(() => true);

      const columnIndex = 3;
      setup();
      const header = screen.getAllByRole('columnheader')[columnIndex];
      const columnContent = header
        .closest('table')
        ?.querySelectorAll(`tbody tr td:nth-child(${columnIndex + 1})`);
      expect(within(header).getByText('Model ID')).toBeInTheDocument();
      expect(columnContent?.length).toBe(3);
      const cells = columnContent!;
      expect(within(cells[0] as HTMLElement).getByText('model-1-id')).toBeInTheDocument();
      expect(within(cells[1] as HTMLElement).getByText('model-2-id')).toBeInTheDocument();
      expect(within(cells[2] as HTMLElement).getByText('model-3-id')).toBeInTheDocument();

      await userEvent.click(within(cells[0] as HTMLElement).getByText('model-1-id'));
      expect(document.execCommand).toHaveBeenCalledWith('copy');

      document.execCommand = execCommandOrigin;
    });

    it('should render Action column and call onViewDetail with the model item of the current table row', async () => {
      const columnIndex = 4;
      const onViewDetailMock = jest.fn();
      const { finalProps } = setup({
        onViewDetail: onViewDetailMock,
      });
      const header = screen.getAllByRole('columnheader')[columnIndex];
      const columnContent = header
        .closest('table')
        ?.querySelectorAll(`tbody tr td:nth-child(${columnIndex + 1})`);
      expect(within(header).getByText('Action')).toBeInTheDocument();
      expect(columnContent?.length).toBe(3);
      const cells = columnContent!;

      await userEvent.click(within(cells[0] as HTMLElement).getByRole('button'));
      expect(onViewDetailMock).toHaveBeenCalledWith(finalProps.items[0]);

      await userEvent.click(within(cells[1] as HTMLElement).getByRole('button'));
      expect(onViewDetailMock).toHaveBeenCalledWith(finalProps.items[1]);

      await userEvent.click(within(cells[2] as HTMLElement).getByRole('button'));
      expect(onViewDetailMock).toHaveBeenCalledWith(finalProps.items[2]);
    });
  });

  it('should call onChange with consistent name sort parameters', async () => {
    const {
      finalProps,
      result: { rerender },
    } = setup();

    await userEvent.click(within(screen.getAllByRole('columnheader')[0]).getByText('Name'));
    expect(finalProps.onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        sort: {
          field: 'name',
          direction: 'desc',
        },
      })
    );

    rerender(
      <ModelDeploymentTable
        {...finalProps}
        sort={{
          field: 'name',
          direction: 'desc',
        }}
      />
    );
    await userEvent.click(within(screen.getAllByRole('columnheader')[0]).getByText('Name'));
    expect(finalProps.onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        sort: {
          field: 'name',
          direction: 'asc',
        },
      })
    );
  });

  it('should call onChange with consistent status sort parameters', async () => {
    const {
      finalProps,
      result: { rerender },
    } = setup({
      sort: {
        field: 'model_state',
        direction: 'asc',
      },
    });

    await userEvent.click(within(screen.getAllByRole('columnheader')[1]).getByText('Status'));
    expect(finalProps.onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        sort: {
          field: 'model_state',
          direction: 'desc',
        },
      })
    );

    rerender(
      <ModelDeploymentTable
        {...finalProps}
        sort={{
          field: 'model_state',
          direction: 'desc',
        }}
      />
    );
    await userEvent.click(within(screen.getAllByRole('columnheader')[1]).getByText('Status'));
    expect(finalProps.onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        sort: {
          field: 'model_state',
          direction: 'asc',
        },
      })
    );
  });

  it('should call onChange with consistent model id sort parameters', async () => {
    const {
      finalProps,
      result: { rerender },
    } = setup({
      sort: {
        field: 'id',
        direction: 'asc',
      },
    });

    await userEvent.click(within(screen.getAllByRole('columnheader')[3]).getByText('Model ID'));
    expect(finalProps.onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        sort: {
          field: 'id',
          direction: 'desc',
        },
      })
    );

    rerender(
      <ModelDeploymentTable
        {...finalProps}
        sort={{
          field: 'id',
          direction: 'desc',
        }}
      />
    );
    await userEvent.click(within(screen.getAllByRole('columnheader')[3]).getByText('Model ID'));
    expect(finalProps.onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        sort: {
          field: 'id',
          direction: 'asc',
        },
      })
    );
  });

  it('should call onChange with consistent pagination parameters', async () => {
    const { finalProps } = setup();

    await userEvent.click(
      within(
        screen.getByTestId('pagination-button-previous').closest('nav') as HTMLElement
      ).getByText('2')
    );
    expect(finalProps.onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        pagination: {
          currentPage: 2,
          pageSize: 10,
        },
      })
    );

    await userEvent.click(screen.getByTestId('tablePaginationPopoverButton'));
    await userEvent.click(screen.getByTestId('tablePagination-50-rows'));
    expect(finalProps.onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        pagination: {
          currentPage: 1,
          pageSize: 50,
        },
      })
    );
  });
});
