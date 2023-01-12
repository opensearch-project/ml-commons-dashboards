/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useCallback, useState } from 'react';
import {
  EuiBasicTable,
  Direction,
  CriteriaWithPagination,
  EuiHealth,
  EuiEmptyPrompt,
} from '@elastic/eui';
import { INode } from './';
import { CopyableText } from '../common';

export function NodesTable(props: { nodes: INode[]; loading: boolean }) {
  const { nodes, loading } = props;
  const [sort, setSort] = useState<{ field: keyof INode; direction: Direction }>({
    field: 'id',
    direction: 'desc',
  });

  const [pageOptions, setPageOptions] = useState({
    index: 0,
    size: 10,
  });

  const items = useMemo(() => {
    const direction = sort.direction;
    const { index, size } = pageOptions;
    const sortedNodes = nodes.sort((a, b) => {
      if (a.id < b.id) {
        return direction === 'asc' ? -1 : 1;
      }
      if (a.id > b.id) {
        return direction === 'asc' ? 1 : -1;
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
        sortable: false,
        render: (deployed: boolean) => {
          const color = deployed ? 'success' : 'danger';
          const label = deployed ? 'Responding' : 'Not responding';
          return <EuiHealth color={color}>{label}</EuiHealth>;
        },
      },
      {
        field: 'id',
        name: 'NODE ID',
        sortable: true,
        render: (id: string) => {
          return <CopyableText text={id} iconLeft={true} />;
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
      pageSizeOptions: [10, 15, 20, 30, 50],
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
        loading ? <EuiEmptyPrompt body={<>Loading...</>} aria-label="loading nodes" /> : null
      }
    />
  );
}
