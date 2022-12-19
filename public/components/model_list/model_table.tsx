/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useCallback, useRef } from 'react';
import {
  CriteriaWithPagination,
  EuiBasicTable,
  EuiBasicTableColumn,
  EuiText,
  Direction,
} from '@elastic/eui';

import { renderTime } from '../../utils';
import { ModelOwner } from './model_owner';
import { ModelDeployedVersions } from './model_deployed_versions';
import { ModelTableUploadingCell } from './model_table_uploading_cell';
import { ModelAggerateSearchItem } from '../../apis/model_aggerate';

export interface ModelTableSort {
  field: 'created_time';
  direction: Direction;
}

export interface ModelTableCriteria {
  pagination: { currentPage: number; pageSize: number };
  sort?: ModelTableSort;
}

export interface ModelTableProps {
  models: ModelAggerateSearchItem[];
  pagination: {
    currentPage: number;
    pageSize: number;
    totalRecords: number | undefined;
  };
  sort: ModelTableSort;
  onChange: (criteria: ModelTableCriteria) => void;
  onModelNameClick: (name: string) => void;
}

export function ModelTable(props: ModelTableProps) {
  const { models, sort, onChange, onModelNameClick } = props;
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const columns = useMemo<Array<EuiBasicTableColumn<ModelAggerateSearchItem>>>(
    () => [
      {
        field: 'name',
        name: 'Model Name',
        width: '266px',
        render: (name: string, record) => (
          <ModelTableUploadingCell
            fallback={
              <EuiText
                onClick={() => {
                  onModelNameClick(name);
                }}
                style={{ color: '#006BB4' }}
              >
                {name}
              </EuiText>
            }
            latestVersionState={record.latest_version_state}
            column="name"
          />
        ),
      },
      {
        field: 'latest_version',
        name: 'Latest version',
        width: '98px',
        align: 'center',
        render: (latestVersion: string, record) => (
          <ModelTableUploadingCell
            fallback={<>{latestVersion}</>}
            latestVersionState={record.latest_version_state}
            column="latestVersion"
          />
        ),
      },
      {
        field: 'description',
        name: 'Description',
        render: (description: string, record) => (
          <ModelTableUploadingCell
            fallback={<>{description}</>}
            latestVersionState={record.latest_version_state}
            column="description"
          />
        ),
      },
      {
        field: 'owner',
        name: 'Owner',
        width: '79px',
        render: (owner: string, record) => (
          <ModelTableUploadingCell
            fallback={<ModelOwner name={owner} />}
            latestVersionState={record.latest_version_state}
            column="owner"
          />
        ),
        align: 'center',
      },
      {
        field: 'deployed_versions',
        name: 'Deployed versions',
        render: (deployedVersions: string[], record) => (
          <ModelTableUploadingCell
            fallback={<ModelDeployedVersions versions={deployedVersions} />}
            latestVersionState={record.latest_version_state}
            column="deployedVersions"
          />
        ),
      },
      {
        field: 'created_time',
        name: 'Created at',
        render: (createdTime: string, record) => (
          <ModelTableUploadingCell
            fallback={<>{renderTime(createdTime, 'MMM D, YYYY')}</>}
            latestVersionState={record.latest_version_state}
            column="createdAt"
          />
        ),
        sortable: true,
      },
    ],
    [onModelNameClick]
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

  const sorting = useMemo(() => ({ sort }), [sort]);

  const handleChange = useCallback((criteria: CriteriaWithPagination<ModelAggerateSearchItem>) => {
    const newPagination = { currentPage: criteria.page.index + 1, pageSize: criteria.page.size };

    onChangeRef.current({
      pagination: newPagination,
      ...(criteria.sort ? { sort: criteria.sort as ModelTableSort } : {}),
    });
  }, []);

  return (
    <EuiBasicTable<ModelAggerateSearchItem>
      columns={columns}
      items={models}
      pagination={pagination}
      onChange={handleChange}
      sorting={sorting}
      hasActions
    />
  );
}
