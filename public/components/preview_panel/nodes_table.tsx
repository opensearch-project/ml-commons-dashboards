/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useCallback, useRef } from 'react';
import { EuiBasicTable, Direction, Criteria, EuiHealth } from '@elastic/eui';
import { NodesTableSort, INode } from './';
import { CopyableText } from '../common';

export interface NodesTableCriteria {
  sort?: NodesTableSort;
}

export function NodesTable(props: {
  nodes: INode[];
  sort: NodesTableSort;
  onChange: (criteria: NodesTableCriteria) => void;
}) {
  const { nodes, sort, onChange } = props;
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

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

  const sorting = useMemo(() => {
    const [field, direction] = sort.split('-');
    return {
      sort: {
        field: field as keyof INode,
        direction: direction as Direction,
      },
    };
  }, [sort]);

  const handleChange = useCallback(({ sort: newSort }: Criteria<INode>) => {
    if (newSort) {
      onChangeRef.current({
        sort: `${newSort.field}-${newSort.direction}` as NodesTableSort,
      });
    }
  }, []);

  return (
    <EuiBasicTable<INode>
      columns={columns}
      items={nodes}
      sorting={sorting}
      onChange={handleChange}
    />
  );
}
