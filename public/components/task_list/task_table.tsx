/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useCallback, useRef } from 'react';
import { CustomItemAction, Direction, EuiBasicTable, EuiButtonIcon } from '@elastic/eui';

import { TaskSearchItem } from '../../apis/task';
import { renderTime } from '../../utils';

export type TaskTableSort =
  | 'createTime-asc'
  | 'createTime-desc'
  | 'lastUpdateTime-asc'
  | 'lastUpdateTime-desc';
export interface TaskTableCriteria {
  pagination: { currentPage: number; pageSize: number };
  sort?: TaskTableSort;
}

export function TaskTable(props: {
  tasks: TaskSearchItem[];
  pagination: {
    currentPage: number;
    pageSize: number;
    totalRecords: number | undefined;
  };
  sort: TaskTableSort;
  onTaskDelete: (id: string) => void;
  onChange: (criteria: TaskTableCriteria) => void;
}) {
  const { tasks, sort, onTaskDelete, onChange } = props;
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const columns = useMemo(
    () => [
      {
        field: 'id',
        name: 'ID',
      },
      {
        field: 'functionName',
        name: 'Function Name',
      },
      {
        field: 'modelId',
        name: 'Model ID',
      },
      {
        field: 'createTime',
        name: 'Create Time',
        render: renderTime,
        sortable: true,
      },
      {
        field: 'lastUpdateTime',
        name: 'Last Update Time',
        render: renderTime,
        sortable: true,
      },
      {
        field: 'isAsync',
        name: 'Async',
      },
      {
        field: 'state',
        name: 'State',
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
                  onTaskDelete(id);
                }}
                data-test-subj={`task-delete-button-${id}`}
              />
            ),
          } as CustomItemAction<TaskSearchItem>,
        ],
      },
    ],
    [onTaskDelete]
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
        field: field as keyof TaskSearchItem,
        direction: direction as Direction,
      },
    };
  }, [sort]);

  const handleChange = useCallback(({ page, sort: newSort }) => {
    const newPagination = { currentPage: page.index + 1, pageSize: page.size };
    if (newSort) {
      onChangeRef.current({
        pagination: newPagination,
        sort: `${newSort.field}-${newSort.direction}` as TaskTableSort,
      });
      return;
    }
    onChangeRef.current({ pagination: newPagination });
  }, []);

  return (
    <EuiBasicTable<TaskSearchItem>
      columns={columns}
      items={tasks}
      pagination={pagination}
      onChange={handleChange}
      sorting={sorting}
    />
  );
}
