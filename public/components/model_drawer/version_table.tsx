/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useCallback, useRef } from 'react';
import { generatePath, useHistory } from 'react-router-dom';
import { EuiBasicTable, Direction, Criteria } from '@elastic/eui';

import { ModelSearchItem } from '../../apis/model';
import { routerPaths } from '../../../common/router_paths';
import { renderTime } from '../../utils';
import type { VersionTableSort } from './';

export interface VersionTableCriteria {
  sort?: VersionTableSort;
}

export function VersionTable(props: {
  models: ModelSearchItem[];
  sort: VersionTableSort;
  onChange: (criteria: VersionTableCriteria) => void;
}) {
  const { models, sort, onChange } = props;
  const history = useHistory();
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const columns = useMemo(
    () => [
      {
        field: 'version',
        name: 'Version',
        sortable: true,
      },
      {
        field: 'state',
        name: 'Stage',
      },
      {
        field: 'algorithm',
        name: 'Algorithm',
      },
      {
        field: 'created_time',
        name: 'Time',
        render: renderTime,
        sortable: true,
      },
    ],
    []
  );
  const rowProps = useCallback(
    ({ id }) => ({
      onClick: () => {
        history.push(generatePath(routerPaths.modelDetail, { id }));
      },
    }),
    [history]
  );

  const sorting = useMemo(() => {
    const [field, direction] = sort.split('-');
    return {
      sort: {
        field: field as keyof ModelSearchItem,
        direction: direction as Direction,
      },
    };
  }, [sort]);

  const handleChange = useCallback(({ sort: newSort }: Criteria<ModelSearchItem>) => {
    if (newSort) {
      onChangeRef.current({
        sort: `${newSort.field}-${newSort.direction}` as VersionTableSort,
      });
    }
  }, []);

  return (
    <EuiBasicTable
      columns={columns}
      items={models}
      rowProps={rowProps}
      sorting={sorting}
      onChange={handleChange}
    />
  );
}
