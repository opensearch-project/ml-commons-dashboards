import React, { useState, useCallback, useMemo, useRef } from 'react';
import { EuiPageHeader, EuiSpacer, EuiPanel } from '@elastic/eui';

import { CoreStart } from '../../../../../src/core/public';
import { APIProvider } from '../../apis/api_provider';
import { useFetcher } from '../../hooks/use_fetcher';
import { TaskTable, TaskTableSort } from './task_table';
import { TaskListFilter, TaskListFilterValue } from './task_list_filter';
import {
  TaskConfirmDeleteModal,
  TaskConfirmDeleteModalInstance,
} from './task_confirm_delete_modal';

export function TaskList({ notifications }: { notifications: CoreStart['notifications'] }) {
  const taskDeleteConfirmModalRef = useRef<TaskConfirmDeleteModalInstance>(null);
  const [params, setParams] = useState<
    TaskListFilterValue & {
      currentPage: number;
      pageSize: number;
      sort: TaskTableSort;
    }
  >({
    currentPage: 1,
    pageSize: 15,
    sort: 'lastUpdateTime-desc',
  });

  const { data, reload } = useFetcher(APIProvider.getAPI('task').search, {
    ...params,
    sort: [params.sort],
    createdStart: params.createdStart?.valueOf(),
    createdEnd: params.createdEnd?.valueOf(),
  });

  const tasks = useMemo(() => data?.data || [], [data]);
  const totalTaskCounts = data?.pagination.totalRecords || 0;

  const pagination = useMemo(
    () => ({
      currentPage: params.currentPage,
      pageSize: params.pageSize,
      totalRecords: totalTaskCounts,
    }),
    [totalTaskCounts, params.currentPage, params.pageSize]
  );

  const handleTaskDeleted = useCallback(async () => {
    reload();
    notifications.toasts.addSuccess('Task has been deleted.');
  }, [reload]);

  const handleFilterChange = useCallback((filter) => {
    setParams((prevParams) => ({ ...prevParams, ...filter }));
  }, []);

  const handleTaskDelete = useCallback((id: string) => {
    taskDeleteConfirmModalRef.current?.show(id);
  }, []);

  const handleTableChange = useCallback((criteria) => {
    const { pagination, sort } = criteria;
    setParams((previousValue) => {
      if (
        pagination.currentPage === previousValue.currentPage &&
        pagination.pageSize === previousValue.pageSize &&
        (!sort || sort === previousValue.sort)
      ) {
        return previousValue;
      }
      return {
        ...previousValue,
        ...criteria.pagination,
        ...(criteria.sort ? { sort: criteria.sort } : {}),
      };
    });
  }, []);

  return (
    <EuiPanel>
      <EuiPageHeader
        pageTitle={
          <>
            Tasks
            {totalTaskCounts !== undefined && (
              <span style={{ fontSize: '0.6em', verticalAlign: 'middle', paddingLeft: 4 }}>
                ({totalTaskCounts})
              </span>
            )}
          </>
        }
        bottomBorder
      />
      <EuiSpacer />
      <TaskListFilter value={params} onChange={handleFilterChange} />
      <EuiSpacer />
      <TaskTable
        tasks={tasks}
        pagination={pagination}
        sort={params.sort}
        onTaskDelete={handleTaskDelete}
        onChange={handleTableChange}
      />
      <TaskConfirmDeleteModal ref={taskDeleteConfirmModalRef} onDeleted={handleTaskDeleted} />
    </EuiPanel>
  );
}
