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
  EuiButtonIcon,
  EuiLink,
} from '@elastic/eui';
import { Criteria } from '@elastic/eui';
import { Link, generatePath } from 'react-router-dom';

import { ModelAggregateItem } from '../../../common';
import { UiSettingDateFormatTime } from '../common';
import { routerPaths } from '../../../common';

import { ModelOwner } from './model_owner';
import { ModelDeployedVersions } from './model_deployed_versions';

export interface ModelTableSort {
  field: 'name' | 'latest_version' | 'description' | 'owner_name' | 'last_updated_time';
  direction: Direction;
}

export interface ModelTableCriteria {
  pagination?: { currentPage: number; pageSize: number };
  sort?: ModelTableSort;
}

export interface ModelTableProps {
  models: ModelAggregateItem[];
  pagination: {
    currentPage: number;
    pageSize: number;
    totalRecords: number | undefined;
  };
  sort: ModelTableSort;
  onChange: (criteria: ModelTableCriteria) => void;
  loading: boolean;
  error: boolean;
  onResetClick: () => void;
}

export function ModelTable(props: ModelTableProps) {
  const { models, sort, onChange, loading, onResetClick, error } = props;
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const columns = useMemo<Array<EuiBasicTableColumn<ModelAggregateItem>>>(
    () => [
      {
        field: 'name',
        name: 'Model Name',
        width: '266px',
        render: (name: string, record) => (
          <Link to={generatePath(routerPaths.model, { id: record.id })}>
            <EuiLink>{name}</EuiLink>
          </Link>
        ),
        sortable: true,
      },
      {
        field: 'latest_version',
        name: 'Latest version',
        width: '98px',
        align: 'center',
        sortable: true,
      },
      {
        field: 'description',
        name: 'Description',
      },
      {
        field: 'owner_name',
        name: 'Owner',
        width: '79px',
        render: (name: string) => <ModelOwner name={name} />,
        align: 'center',
        sortable: true,
      },
      {
        field: 'deployed_versions',
        name: 'Deployed versions',
        render: (deployedVersions: string[]) => (
          <ModelDeployedVersions versions={deployedVersions} />
        ),
      },
      {
        field: 'last_updated_time',
        name: 'Last updated',
        render: (lastUpdatedTime: number) => <UiSettingDateFormatTime time={lastUpdatedTime} />,
        sortable: true,
      },
      {
        name: 'Actions',
        actions: [
          {
            render: ({ id }) => (
              <Link to={generatePath(routerPaths.registerModel, { id })}>
                <EuiButtonIcon aria-label="Register new version" iconType="plusInCircle" />
              </Link>
            ),
          },
          {
            render: () => <EuiButtonIcon aria-label="Delete model" iconType="trash" />,
          },
        ],
      },
    ],
    []
  );

  const pagination = useMemo(
    () => ({
      pageIndex: props.pagination.currentPage - 1,
      pageSize: props.pagination.pageSize,
      totalItemCount: props.pagination.totalRecords || 0,
      pageSizeOptions: [10, 20, 50],
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

  const handleChange = useCallback((criteria: Criteria<ModelAggregateItem>) => {
    onChangeRef.current({
      ...(criteria.page
        ? { pagination: { currentPage: criteria.page.index + 1, pageSize: criteria.page.size } }
        : {}),
      ...(criteria.sort ? { sort: criteria.sort as ModelTableSort } : {}),
    });
  }, []);

  return (
    <EuiBasicTable<ModelAggregateItem>
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
