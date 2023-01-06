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
    expect(screen.getByRole('link').getAttribute('href')).toEqual('/todo');
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
      expect(
        within(cells[0] as HTMLElement).getByText('Partially responding on 1 of 3 nodes')
      ).toBeInTheDocument();
      expect(
        within(cells[1] as HTMLElement).getByText('Responding on 3 of 3 nodes')
      ).toBeInTheDocument();
      expect(
        within(cells[2] as HTMLElement).getByText('Not responding on 3 of 3 nodes')
      ).toBeInTheDocument();
    });

    it('should render ID at third column and copy to clipboard after button clicked', async () => {
      const execCommandOrigin = document.execCommand;
      document.execCommand = jest.fn(() => true);

      const columnIndex = 2;
      setup();
      const header = screen.getAllByRole('columnheader')[columnIndex];
      const columnContent = header
        .closest('table')
        ?.querySelectorAll(`tbody tr td:nth-child(${columnIndex + 1})`);
      expect(within(header).getByText('ID')).toBeInTheDocument();
      expect(columnContent?.length).toBe(3);
      const cells = columnContent!;
      expect(within(cells[0] as HTMLElement).getByText('model-1-id')).toBeInTheDocument();
      expect(within(cells[1] as HTMLElement).getByText('model-2-id')).toBeInTheDocument();
      expect(within(cells[2] as HTMLElement).getByText('model-3-id')).toBeInTheDocument();

      const firstCopyButton = within(cells[0] as HTMLElement).getByRole('button');
      expect(firstCopyButton).toBeInTheDocument();
      await userEvent.click(firstCopyButton);
      expect(document.execCommand).toHaveBeenCalledWith('copy');

      document.execCommand = execCommandOrigin;
    });

    it('should render Action column and call onViewDetail with consistent model id', async () => {
      const columnIndex = 3;
      const onViewDetailMock = jest.fn();
      setup({
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
      expect(onViewDetailMock).toHaveBeenCalledWith('model-1-id');

      await userEvent.click(within(cells[1] as HTMLElement).getByRole('button'));
      expect(onViewDetailMock).toHaveBeenCalledWith('model-2-id');

      await userEvent.click(within(cells[2] as HTMLElement).getByRole('button'));
      expect(onViewDetailMock).toHaveBeenCalledWith('model-3-id');
    });
  });

  it('should call onChange with consistent sort parameters', async () => {
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
