/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useCallback, useRef } from 'react';
import { generatePath, useHistory } from 'react-router-dom';
import {
  CriteriaWithPagination,
  CustomItemAction,
  Direction,
  EuiBasicTable,
  EuiButtonIcon,
} from '@elastic/eui';

import { ModelSearchItem } from '../../apis/model';
import { routerPaths } from '../../../common/router_paths';
import { renderTime } from '../../utils';

export type ModelTableSort = 'trainTime-desc' | 'trainTime-asc';
export interface ModelTableCriteria {
  pagination: { currentPage: number; pageSize: number };
  sort?: ModelTableSort;
}

export function ModelTable(props: {
  models: ModelSearchItem[];
  pagination: {
    currentPage: number;
    pageSize: number;
    totalRecords: number | undefined;
  };
  sort: ModelTableSort;
  onModelDelete: (id: string) => void;
  onChange: (criteria: ModelTableCriteria) => void;
}) {
  const { sort, models, onChange, onModelDelete } = props;
  const history = useHistory();
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const columns = useMemo(
    () => [
      {
        field: 'id',
        name: 'ID',
      },
      {
        field: 'name',
        name: 'Name',
      },
      {
        field: 'algorithm',
        name: 'Algorithm',
      },
      {
        field: 'context',
        name: 'Context',
        width: '500px',
      },
      {
        field: 'trainTime',
        name: 'Train Time',
        render: renderTime,
        sortable: true,
      },
      {
        name: 'Actions',
        actions: [
          {
            render: ({ id }) => (
              <EuiButtonIcon
                iconType="trash"
                color="danger"
                onClick={(e: { stopPropagation: () => void }) => {
                  e.stopPropagation();
                  onModelDelete(id);
                }}
              />
            ),
          } as CustomItemAction<ModelSearchItem>,
        ],
      },
    ],
    [onModelDelete]
  );

  const pagination = useMemo(
    () => ({
      pageIndex: props.pagination.currentPage - 1,
      pageSize: props.pagination.pageSize,
      totalItemCount: props.pagination.totalRecords || 0,
      pageSizeOptions: [15, 30, 50, 100],
      showPerPageOptions: true,
    }),
    [props.pagination]
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

  const handleChange = useCallback(
    ({ page, sort: newSort }: CriteriaWithPagination<ModelSearchItem>) => {
      const newPagination = { currentPage: page.index + 1, pageSize: page.size };
      if (newSort) {
        onChangeRef.current({
          pagination: newPagination,
          sort: `${newSort.field}-${newSort.direction}` as ModelTableSort,
        });
        return;
      }
      onChangeRef.current({ pagination: newPagination });
    },
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

  return (
    <EuiBasicTable<ModelSearchItem>
      columns={columns}
      items={models}
      pagination={pagination}
      onChange={handleChange}
      rowProps={rowProps}
      sorting={sorting}
    />
  );
}
