/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useCallback, useRef } from 'react';
import { EuiBasicTable, Direction, Criteria, EuiBasicTableColumn } from '@elastic/eui';

import { ModelVersionSearchItem } from '../../apis/model_version';
import { renderTime } from '../../utils';
import type { VersionTableSort } from './';

export interface VersionTableCriteria {
  sort?: VersionTableSort;
}

export function VersionTable(props: {
  models: ModelVersionSearchItem[];
  sort: VersionTableSort;
  onChange: (criteria: VersionTableCriteria) => void;
}) {
  const { models, sort, onChange } = props;
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const columns: Array<EuiBasicTableColumn<ModelVersionSearchItem>> = [
    {
      field: 'model_version',
      name: 'Version',
      sortable: false,
    },
    {
      field: 'model_state',
      name: 'Stage',
    },
    {
      field: 'algorithm',
      name: 'Algorithm',
    },
    {
      field: 'created_time',
      name: 'Time',
      render: (time: string) => {
        return renderTime(time);
      },
      sortable: false,
    },
  ];
  const rowProps = useCallback(
    ({ id }) => ({
      onClick: () => {
        // TODO: update after exsiting detail page
        // history.push(generatePath(routerPaths.modelDetail, { id }));
      },
    }),
    []
  );

  const sorting = useMemo(() => {
    const [field, direction] = sort.split('-');
    return {
      sort: {
        field: field as keyof ModelVersionSearchItem,
        direction: direction as Direction,
      },
    };
  }, [sort]);

  const handleChange = useCallback(({ sort: newSort }: Criteria<ModelVersionSearchItem>) => {
    if (newSort) {
      onChangeRef.current({
        sort: `${newSort.field}-${newSort.direction}` as VersionTableSort,
      });
    }
  }, []);

  return (
    <EuiBasicTable<ModelVersionSearchItem>
      columns={columns}
      items={models}
      rowProps={rowProps}
      sorting={sorting}
      onChange={handleChange}
    />
  );
}
