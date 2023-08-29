/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen, within } from '../../../../test/test_utils';
import { NodesTable } from '../nodes_table';

const NODES = [
  {
    id: 'id1',
    deployed: true,
  },
  {
    id: 'id2',
    deployed: false,
  },
];

function setup({ nodes = NODES, loading = false, nodesStatus = 'Responding on 1 of 2 nodes' }) {
  const user = userEvent.setup({});
  render(<NodesTable nodes={nodes} loading={loading} nodesStatus={nodesStatus} />);
  return { user };
}

describe('<NodesTable />', () => {
  it('should render table and 2 columns when pass nodes', () => {
    setup({});
    expect(screen.getAllByRole('columnheader').length).toBe(2);
    expect(screen.getByText('id1')).toBeInTheDocument();
    expect(screen.getByText('id2')).toBeInTheDocument();
    expect(screen.getByText('Responding on 1 of 2 nodes')).toBeInTheDocument();
  });

  it('should render status at first column with asc by default', () => {
    const columnIndex = 0;
    setup({});
    const header = screen.getAllByRole('columnheader')[columnIndex];
    const columnContent = header
      .closest('table')
      ?.querySelectorAll(`tbody tr td:nth-child(${columnIndex + 1})`);
    expect(within(header).getByText('Status')).toBeInTheDocument();
    expect(columnContent?.length).toBe(2);
    const cells = columnContent!;
    expect(within(cells[0] as HTMLElement).getByText('Not responding')).toBeInTheDocument();
    expect(within(cells[1] as HTMLElement).getByText('Responding')).toBeInTheDocument();
  });

  it('should render node id at second column with desc by default', () => {
    const columnIndex = 1;
    setup({});
    const header = screen.getAllByRole('columnheader')[columnIndex];
    const columnContent = header
      .closest('table')
      ?.querySelectorAll(`tbody tr td:nth-child(${columnIndex + 1})`);
    expect(within(header).getByText('Node ID')).toBeInTheDocument();
    expect(columnContent?.length).toBe(2);
    const cells = columnContent!;
    expect(within(cells[0] as HTMLElement).getByText('id2')).toBeInTheDocument();
    expect(within(cells[1] as HTMLElement).getByText('id1')).toBeInTheDocument();
  });

  it('should render loading state when loading is true', () => {
    setup({ nodes: [], loading: true });
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });
});
