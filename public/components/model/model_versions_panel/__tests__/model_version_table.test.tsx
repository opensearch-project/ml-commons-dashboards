/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import userEvent from '@testing-library/user-event';

import { render, screen, waitFor } from '../../../../../test/test_utils';
import { ModelVersionTable } from '../model_version_table';
import { MODEL_STATE } from '../../../../../common';
import { within } from '@testing-library/dom';

const versions = [
  {
    id: '1',
    name: 'model-1',
    version: '1.0.0',
    state: MODEL_STATE.uploading,
    tags: { 'Accuracy: test': 0.98, 'Accuracy: train': 0.99 },
    lastUpdated: 1682676759143,
    createdTime: 1682676759143,
  },
];

describe('<ModelVersionTable />', () => {
  it('should render consistent columns header ', async () => {
    render(<ModelVersionTable versions={[]} tags={['Accuracy: test', 'Accuracy: train']} />);

    await waitFor(() => {
      expect(screen.getByTestId('dataGridHeaderCell-version')).toBeInTheDocument();
      expect(screen.getByTestId('dataGridHeaderCell-state')).toBeInTheDocument();
      expect(screen.getByTestId('dataGridHeaderCell-status')).toBeInTheDocument();
      expect(screen.getByTestId('dataGridHeaderCell-lastUpdated')).toBeInTheDocument();
      expect(screen.getByTestId('dataGridHeaderCell-tags.Accuracy: test')).toBeInTheDocument();
      expect(screen.getByTestId('dataGridHeaderCell-tags.Accuracy: train')).toBeInTheDocument();
    });
  });

  it(
    'should render sorted column and call onSort after sort change',
    async () => {
      const user = userEvent.setup();
      const onSortMock = jest.fn();
      render(
        <ModelVersionTable
          versions={[]}
          tags={[]}
          sorting={{
            columns: [{ id: 'version', direction: 'asc' }],
            onSort: onSortMock,
          }}
        />
      );

      await waitFor(async () => {
        expect(screen.getByTestId('dataGridHeaderCellSortingIcon-version')).toBeInTheDocument();
        await user.click(screen.getByText('Version'));
        expect(screen.getByText('Sort A-Z').closest('li')).toHaveClass(
          'euiDataGridHeader__action--selected'
        );
      });

      expect(onSortMock).not.toHaveBeenCalled();
      await user.click(screen.getByText('Sort Z-A'));
      expect(onSortMock).toHaveBeenCalledWith([{ direction: 'desc', id: 'version' }]);
    },
    40 * 1000
  );

  it(
    'should NOT render sort button for state and status column',
    async () => {
      const user = userEvent.setup();
      render(<ModelVersionTable versions={[]} tags={[]} />);

      await user.click(screen.getByText('State'));
      expect(screen.queryByTitle('Sort A-Z')).toBeNull();

      await user.click(screen.getByText('Status'));
      expect(screen.queryByTitle('Sort A-Z')).toBeNull();
    },
    20 * 1000
  );

  it('should render consistent versions values', () => {
    render(<ModelVersionTable versions={versions} tags={['Accuracy: test', 'Accuracy: train']} />);

    const gridCells = screen.getAllByRole('gridcell');
    expect(gridCells.length).toBe(7);
    expect(within(gridCells[0]).getByText('1.0.0')).toBeInTheDocument();
    expect(within(gridCells[1]).getByText('Not deployed')).toBeInTheDocument();
    expect(within(gridCells[2]).getByText('In progress...')).toBeInTheDocument();
    expect(within(gridCells[3]).getByText('Apr 28, 2023 10:12 AM')).toBeInTheDocument();
    expect(within(gridCells[4]).getByText('0.98')).toBeInTheDocument();
    expect(within(gridCells[5]).getByText('0.99')).toBeInTheDocument();
    expect(within(gridCells[6]).getByLabelText('show actions')).toBeInTheDocument();
  });

  it(
    'should render pagination and call onChangePageMock and onChangeItemsPerPageMock if pagination provided',
    async () => {
      const user = userEvent.setup();
      const onChangePageMock = jest.fn();
      const onChangeItemsPerPageMock = jest.fn();
      render(
        <ModelVersionTable
          versions={versions}
          tags={['Accuracy: test', 'Accuracy: train']}
          totalVersionCount={101}
          pagination={{
            pageIndex: 0,
            pageSize: 25,
            pageSizeOptions: [10, 25, 50],
            onChangePage: onChangePageMock,
            onChangeItemsPerPage: onChangeItemsPerPageMock,
          }}
        />
      );

      expect(screen.getByText('Rows per page: 25')).toBeInTheDocument();
      expect(screen.getByLabelText('Page 1 of 5')).toHaveClass('euiPaginationButton-isActive');

      await user.click(screen.getByText('Rows per page: 25'));

      expect(onChangeItemsPerPageMock).not.toHaveBeenCalled();
      await user.click(screen.getByText('10 rows'));
      expect(onChangeItemsPerPageMock).toHaveBeenCalledWith(10);
      await user.click(screen.getByText('Rows per page: 25'));

      expect(onChangePageMock).not.toHaveBeenCalled();
      await user.click(screen.getByLabelText('Page 2 of 5'));
      expect(onChangePageMock).toHaveBeenCalledWith(1);
    },
    20 * 1000
  );

  it(
    'should show status details after status cell expand button clicked',
    async () => {
      const user = userEvent.setup();
      render(<ModelVersionTable versions={versions} tags={[]} />);

      await user.hover(screen.getByText('In progress...'));
      await user.click(
        screen.getByText('In progress...').closest('div[role="gridcell"]')!.querySelector('button')!
      );

      expect(screen.getByText(/The model artifact for.*is uploading./)).toBeInTheDocument();
    },
    10 * 1000
  );
});
