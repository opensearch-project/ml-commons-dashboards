/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useMemo } from 'react';
import {
  Criteria,
  Direction,
  EuiBasicTable,
  EuiButton,
  EuiButtonIcon,
  EuiCopy,
  EuiEmptyPrompt,
  EuiHealth,
  EuiIcon,
  EuiSpacer,
  EuiLink,
} from '@elastic/eui';

import { ModelDeploymentProfile } from '../../apis/profile';

/**
 * We can't use the noItemsMessage to display the empty content, because
 * there is a bottom line can't remove it. We should display a fake cell content
 * to remove the bottom line.
 */
const emptyOrLoadingTableProps = {
  items: [
    {
      id: '',
      name: '',
      deployed_node_ids: [],
      target_node_ids: [],
      not_deployed_node_ids: [],
    },
  ],
  cellProps: () => ({
    style: { display: 'none' },
  }),
};

export interface ModelDeploymentTableSort {
  field: 'name';
  direction: Direction;
}

export interface ModelDeploymentTableCriteria {
  pagination?: { currentPage: number; pageSize: number };
  sort?: ModelDeploymentTableSort;
}

export interface ModelDeploymentTableProps {
  items: ModelDeploymentProfile[];
  loading?: boolean;
  noTable?: boolean;
  pagination?: {
    currentPage: number;
    pageSize: number;
    totalRecords: number | undefined;
  };
  sort: ModelDeploymentTableSort;
  onChange: (criteria: ModelDeploymentTableCriteria) => void;
  onViewDetail?: (id: string) => void;
  onResetSearchClick?: () => void;
}

export const ModelDeploymentTable = ({
  sort,
  items,
  loading,
  noTable,
  pagination: paginationInProps,
  onChange,
  onViewDetail,
  onResetSearchClick,
}: ModelDeploymentTableProps) => {
  const columns = useMemo(
    () => [
      {
        field: 'name',
        name: 'Name',
        width: '299px',
        sortable: true,
      },
      {
        field: 'id',
        name: 'Status',
        width: '338px',
        render: (
          _id: string,
          {
            deployed_node_ids: deployedIds,
            not_deployed_node_ids: notDeployedIds,
          }: ModelDeploymentProfile
        ) => {
          if (deployedIds.length === 0) {
            return (
              <EuiHealth color="danger">
                Not responding on {notDeployedIds.length} of {notDeployedIds.length} nodes
              </EuiHealth>
            );
          }
          if (notDeployedIds.length === 0) {
            return (
              <EuiHealth color="success">
                Responding on {deployedIds.length} of {deployedIds.length} nodes
              </EuiHealth>
            );
          }
          return (
            <EuiHealth color="warning">
              Partially responding on {deployedIds.length} of{' '}
              {deployedIds.length + notDeployedIds.length} nodes
            </EuiHealth>
          );
        },
      },
      {
        field: 'id',
        name: 'ID',
        width: '266px',
        render: (id) => (
          <>
            <EuiCopy textToCopy={id}>
              {(copy) => (
                <EuiButtonIcon
                  aria-label="copy"
                  iconType="copy"
                  style={{ marginRight: 4 }}
                  onClick={copy}
                />
              )}
            </EuiCopy>
            {id}
          </>
        ),
      },
      {
        field: 'id',
        name: 'Action',
        align: 'right' as const,
        width: '120px',
        render: (id: string) => {
          return (
            <EuiButtonIcon
              onClick={() => {
                onViewDetail?.(id);
              }}
              role="button"
              aria-label="view detail"
              iconType="inspect"
            />
          );
        },
      },
    ],
    [onViewDetail]
  );
  const sorting = useMemo(() => ({ sort }), [sort]);
  const emptyOrLoading = loading || items.length === 0;

  const pagination = useMemo(
    () =>
      paginationInProps
        ? {
            pageIndex: paginationInProps.currentPage - 1,
            pageSize: paginationInProps.pageSize,
            totalItemCount: paginationInProps.totalRecords || 0,
            pageSizeOptions: [10, 20, 50],
            showPerPageOptions: true,
          }
        : undefined,
    [paginationInProps]
  );

  const handleChange = useCallback(
    (criteria: Criteria<ModelDeploymentProfile>) => {
      onChange({
        ...(criteria.page
          ? { pagination: { currentPage: criteria.page.index + 1, pageSize: criteria.page.size } }
          : {}),
        ...(criteria.sort ? { sort: criteria.sort as ModelDeploymentTableSort } : {}),
      });
    },
    [onChange]
  );

  return (
    <>
      {!noTable && (
        <EuiBasicTable
          columns={columns}
          sorting={sorting}
          loading={loading}
          onChange={handleChange}
          {...(emptyOrLoading ? emptyOrLoadingTableProps : { items, pagination })}
        />
      )}
      {emptyOrLoading && (
        <div style={{ paddingTop: 48, paddingBottom: 32 }}>
          {loading ? (
            <EuiEmptyPrompt
              body={
                <>
                  <EuiSpacer size="l" />
                  Loading deployed models...
                  <EuiSpacer size="xl" />
                </>
              }
              aria-label="loading models"
            />
          ) : noTable ? (
            <EuiEmptyPrompt
              style={{ maxWidth: 528 }}
              body={
                <>
                  <EuiSpacer size="l" />
                  Deployed models will appear here. For more information, see{' '}
                  <EuiLink role="link" href="/todo">
                    Model Serving Framework Documentation
                    <EuiIcon type="popout" />
                  </EuiLink>
                  .
                  <EuiSpacer size="xl" />
                </>
              }
              aria-label="no deployed models"
            />
          ) : (
            <EuiEmptyPrompt
              title={<EuiSpacer size="s" />}
              body={
                <>
                  There are no results to your search. Reset the search criteria to view the
                  deployed models.
                </>
              }
              actions={
                <>
                  <EuiSpacer size="s" />
                  <EuiButton role="button" onClick={onResetSearchClick} size="m">
                    Reset search
                  </EuiButton>
                </>
              }
              aria-label="no models results"
            />
          )}
        </div>
      )}
    </>
  );
};
