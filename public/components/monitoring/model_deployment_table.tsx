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

export interface ModelDeploymentTableSort {
  field: 'name';
  direction: Direction;
}

export interface ModelDeploymentTableCriteria {
  pagination?: { currentPage: number; pageSize: number };
  sort?: ModelDeploymentTableSort;
}

export interface ModelDeploymentItem {
  id: string;
  name: string;
  respondingNodesCount: number | undefined;
  planningNodesCount: number | undefined;
  notRespondingNodesCount: number | undefined;
}

export interface ModelDeploymentTableProps {
  items: ModelDeploymentItem[];
  loading?: boolean;
  noTable?: boolean;
  pagination?: {
    currentPage: number;
    pageSize: number;
    totalRecords: number | undefined;
  };
  sort: ModelDeploymentTableSort;
  onChange: (criteria: ModelDeploymentTableCriteria) => void;
  onViewDetail?: (modelDeploymentItem: ModelDeploymentItem) => void;
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
          { planningNodesCount, respondingNodesCount, notRespondingNodesCount }: ModelDeploymentItem
        ) => {
          if (
            planningNodesCount === undefined ||
            respondingNodesCount === undefined ||
            notRespondingNodesCount === undefined
          ) {
            return '-';
          }
          if (respondingNodesCount === 0) {
            return (
              <EuiHealth color="danger">
                <div>
                  <span style={{ fontWeight: 600 }}>Not responding</span> on {planningNodesCount} of{' '}
                  {planningNodesCount} nodes
                </div>
              </EuiHealth>
            );
          }
          if (notRespondingNodesCount === 0) {
            return (
              <EuiHealth color="success">
                <div>
                  <span style={{ fontWeight: 600 }}>Responding</span> on {planningNodesCount} of{' '}
                  {planningNodesCount} nodes
                </div>
              </EuiHealth>
            );
          }
          return (
            <EuiHealth color="warning">
              <div>
                <span style={{ fontWeight: 600 }}>Partially responding</span> on{' '}
                {respondingNodesCount} of {planningNodesCount} nodes
              </div>
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
        render: (id: string, modelDeploymentItem: ModelDeploymentItem) => {
          return (
            <EuiButtonIcon
              onClick={() => {
                onViewDetail?.(modelDeploymentItem);
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
    (criteria: Criteria<ModelDeploymentItem>) => {
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
      {noTable ? (
        <div style={{ paddingTop: 48, paddingBottom: 32 }}>
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
        </div>
      ) : (
        <EuiBasicTable
          columns={columns}
          sorting={sorting}
          loading={loading}
          onChange={handleChange}
          items={items}
          pagination={items.length > 0 ? pagination : undefined}
          noItemsMessage={
            <div style={{ padding: 40 }}>
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
          }
        />
      )}
    </>
  );
};
