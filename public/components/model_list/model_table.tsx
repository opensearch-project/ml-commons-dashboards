/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useCallback, useRef } from 'react';
import {
  EuiBasicTable,
  EuiBasicTableColumn,
  EuiText,
  Direction,
  EuiLoadingSpinner,
  EuiTitle,
  EuiEmptyPrompt,
  EuiButton,
  EuiSpacer,
  EuiIcon,
} from '@elastic/eui';

import { Criteria } from '@elastic/eui';
import { renderTime } from '../../utils';
import { ModelOwner } from './model_owner';
import { ModelDeployedVersions } from './model_deployed_versions';
import { ModelTableUploadingCell } from './model_table_uploading_cell';
import { ModelAggregateSearchItem } from '../../apis/model_aggregate';

export interface ModelTableSort {
  field: 'created_time';
  direction: Direction;
}

export interface ModelTableCriteria {
  pagination?: { currentPage: number; pageSize: number };
  sort?: ModelTableSort;
}

export interface ModelTableProps {
  models: ModelAggregateSearchItem[];
  pagination: {
    currentPage: number;
    pageSize: number;
    totalRecords: number | undefined;
  };
  sort: ModelTableSort;
  onChange: (criteria: ModelTableCriteria) => void;
  onModelNameClick: (name: string) => void;
  loading: boolean;
  error: boolean;
  onResetClick: () => void;
  onModelDeleteClick: (name: string, argsdeployedVersions: string[]) => void;
}

export function ModelTable(props: ModelTableProps) {
  const {
    models,
    sort,
    onChange,
    onModelNameClick,
    loading,
    onResetClick,
    error,
    onModelDeleteClick,
  } = props;
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const columns = useMemo<Array<EuiBasicTableColumn<ModelAggregateSearchItem>>>(
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
      {
        name: 'Actions',
        actions: [
          // TODO: add a new task to update after design completed
          {
            name: 'Prevew',
            description: 'Preview model group',
            type: 'icon',
            icon: 'plusInCircle',
            onClick: ({ name }) => {
              onModelNameClick(name);
            },
          },
          // TODO: add a new task to update after design completed
          {
            name: 'Delete',
            description: 'Delete this',
            type: 'icon',
            icon: 'trash',
            onClick: ({ name, ...args }) => {
              onModelDeleteClick(name, args.deployed_versions);
            },
          },
        ],
      },
    ],
    [onModelNameClick, onModelDeleteClick]
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

  const noItemsMessage = useMemo(
    () => (
      <div style={{ padding: '8px 0 12px 0' }}>
        {loading && (
          <EuiEmptyPrompt
            body={
              <>
                <EuiSpacer size="l" />
                <EuiLoadingSpinner size="xl" />
                <EuiSpacer size="s" />
                <EuiTitle>
                  <h2 style={{ marginTop: 0, marginBottom: 0, paddingBottom: 72 }}>
                    Loading models
                  </h2>
                </EuiTitle>
              </>
            }
          />
        )}
        {!loading && error && (
          <EuiEmptyPrompt
            body={
              <>
                <EuiSpacer size="l" />
                <EuiIcon type="alert" size="xl" color="danger" />
                <EuiSpacer size="m" />
                <EuiTitle>
                  <h2 style={{ marginTop: 0, marginBottom: 0 }}>Failed to load models</h2>
                </EuiTitle>
                <EuiSpacer size="m" />
                <EuiText>Check your internet connection </EuiText>
              </>
            }
          />
        )}
        {!loading && !error && (
          <EuiEmptyPrompt
            body={
              <>
                <EuiSpacer size="l" />
                <EuiSpacer size="l" />
                There are no results for your search. Reset the search criteria to view registered
                models.
                <EuiSpacer size="s" />
              </>
            }
            actions={
              <>
                <EuiButton onClick={onResetClick}>Reset search and filters</EuiButton>
                <EuiSpacer size="l" />
              </>
            }
          />
        )}
      </div>
    ),
    [onResetClick, loading, error]
  );

  const handleChange = useCallback((criteria: Criteria<ModelAggregateSearchItem>) => {
    onChangeRef.current({
      ...(criteria.page
        ? { pagination: { currentPage: criteria.page.index + 1, pageSize: criteria.page.size } }
        : {}),
      ...(criteria.sort ? { sort: criteria.sort as ModelTableSort } : {}),
    });
  }, []);

  return (
    <EuiBasicTable<ModelAggregateSearchItem>
      columns={columns}
      items={loading || error ? [] : models}
      pagination={models.length > 0 ? pagination : undefined}
      onChange={handleChange}
      sorting={sorting}
      hasActions
      noItemsMessage={noItemsMessage}
    />
  );
}
