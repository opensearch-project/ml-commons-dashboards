/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useCallback, useState } from 'react';
import { EuiBasicTable, Direction, CriteriaWithPagination, EuiHealth } from '@elastic/eui';
import { INode } from './';
import { CopyableText } from '../common';

type NodesTableSort = 'id-desc' | 'id-asc';

export interface NodesTableCriteria {
  sort?: NodesTableSort;
}

export function NodesTable(props: { nodes: INode[] }) {
  const { nodes } = props;
  const [sort, setSort] = useState<NodesTableSort>('id-desc');

  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const generateItems = useCallback(
    ({ direction, index, size }) => {
      const sortedNodes = direction
        ? nodes.sort((a, b) => {
            if (a.id < b.id) {
              return direction === 'asc' ? -1 : 1;
            }
            if (a.id > b.id) {
              return direction === 'asc' ? 1 : -1;
            }
            return 0;
          })
        : nodes;
      const startIndex = index * size,
        endIndex = (index + 1) * size;
      const result = sortedNodes.slice(startIndex, endIndex);
      return result;
    },
    [nodes]
  );

  const [items, setItems] = useState(
    generateItems({ index: pageIndex, size: pageSize, direction: sort.split('-')[1] })
  );

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
      pageIndex,
      pageSize,
      totalItemCount: nodes.length,
      pageSizeOptions: [10, 15, 20, 30, 50],
      showPerPageOptions: true,
    }),
    [pageIndex, pageSize, nodes]
  );

  const sorting = useMemo(() => {
    const [field, direction] = sort.split('-');
    return {
      sort: {
        field: field as keyof INode,
        direction: direction as Direction,
      },
    };
  }, [sort]);

  const handleTableChange = useCallback(
    ({ sort: newSort, page }: CriteriaWithPagination<INode>) => {
      const { index, size } = page;
      setPageIndex(index);
      setPageSize(size);
      if (newSort) {
        setSort(`${newSort.field}-${newSort.direction}` as NodesTableSort);
      }
      const newItems = generateItems({ direction: newSort?.direction, index, size });
      setItems(newItems);
    },
    []
  );

  return (
    <EuiBasicTable<INode>
      columns={columns}
      items={items}
      sorting={sorting}
      pagination={pagination}
      onChange={handleTableChange}
    />
  );
}
