/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import './nodes_table.scss';

import React, { useMemo, useCallback, useState } from 'react';
import {
  EuiBasicTable,
  Direction,
  CriteriaWithPagination,
  EuiHealth,
  EuiEmptyPrompt,
  EuiCopy,
  EuiText,
} from '@elastic/eui';
import { INode } from './';

export function NodesTable(props: { nodes: INode[]; loading: boolean }) {
  const { nodes, loading } = props;
  const [sort, setSort] = useState<{ field: keyof INode; direction: Direction }>({
    field: 'deployed',
    direction: 'asc',
  });

  const [pageOptions, setPageOptions] = useState({
    index: 0,
    size: 10,
  });

  const items = useMemo(() => {
    const { field, direction } = sort;
    const { index, size } = pageOptions;
    const sortedNodes = nodes.sort((a, b) => {
      if (field === 'id') {
        const compareResult = a.id.localeCompare(b.id);
        return direction === 'asc' ? compareResult : -compareResult;
      }
      if (field === 'deployed') {
        return direction === 'asc'
          ? Number(a.deployed) - Number(b.deployed)
          : Number(b.deployed) - Number(a.deployed);
      }
      return 0;
    });
    const startIndex = index * size;
    const endIndex = (index + 1) * size;
    const result = sortedNodes.slice(startIndex, endIndex);
    return result;
  }, [sort, pageOptions, nodes]);

  const columns = useMemo(
    () => [
      {
        field: 'deployed',
        name: 'Status',
        sortable: true,
        render: (deployed: boolean) => {
          const color = deployed ? 'success' : 'danger';
          const label = deployed ? 'Responding' : 'Not responding';
          return <EuiHealth color={color}>{label}</EuiHealth>;
        },
      },
      {
        field: 'id',
        name: 'Node ID',
        sortable: true,
        render: (id: string) => {
          return (
            <EuiCopy textToCopy={id} beforeMessage="Copy node ID">
              {(copy) => (
                <EuiText onClick={copy} className="ml-nodesTableNodeIdCellText" size="s">
                  {id}
                </EuiText>
              )}
            </EuiCopy>
          );
        },
      },
    ],
    []
  );

  const pagination = useMemo(
    () => ({
      pageIndex: pageOptions.index,
      pageSize: pageOptions.size,
      totalItemCount: nodes.length,
      pageSizeOptions: [10, 20, 50],
      showPerPageOptions: true,
    }),
    [pageOptions, nodes]
  );

  const handleTableChange = useCallback(
    ({ sort: newSort, page }: CriteriaWithPagination<INode>) => {
      const { index, size } = page;
      setPageOptions({ index, size });
      if (newSort) {
        setSort({
          field: newSort.field,
          direction: newSort.direction,
        });
      }
    },
    []
  );

  return (
    <EuiBasicTable<INode>
      columns={columns}
      items={items}
      sorting={{ sort }}
      pagination={pagination}
      onChange={handleTableChange}
      loading={loading}
      noItemsMessage={
        loading ? <EuiEmptyPrompt body={<>Loading...</>} aria-label="loading nodes" /> : undefined
      }
    />
  );
}
