/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useState, useMemo } from 'react';
import {
  EuiDataGrid,
  EuiDataGridProps,
  EuiTablePagination,
  EuiDataGridCellValueElementProps,
  EuiIcon,
  EuiDataGridColumn,
  EuiCopy,
  EuiButtonEmpty,
  copyToClipboard,
} from '@elastic/eui';

import { VersionTableDataItem } from '../types';

import { ModelVersionCell } from './model_version_cell';
import { ModelVersionTableRowActions } from './model_version_table_row_actions';

const ExpandCopyIDButton = ({ textToCopy }: { textToCopy: string }) => {
  const [isCopied, setIsCopied] = useState(false);

  return (
    <EuiButtonEmpty
      onClick={() => {
        copyToClipboard(textToCopy);
        setIsCopied(true);
      }}
      iconType="copy"
      style={{ width: 102 }}
    >
      {isCopied ? 'Copied' : 'Copy ID'}
    </EuiButtonEmpty>
  );
};

interface VersionTableProps extends Pick<EuiDataGridProps, 'pagination' | 'sorting'> {
  tags: string[];
  versions: VersionTableDataItem[];
  totalVersionCount?: number;
}

export const ModelVersionTable = ({
  tags,
  sorting,
  versions,
  pagination,
  totalVersionCount,
}: VersionTableProps) => {
  const columns = useMemo<EuiDataGridColumn[]>(
    () => [
      {
        id: 'version',
        displayAsText: 'Version',
        defaultSortDirection: 'asc' as const,
      },
      {
        id: 'state',
        displayAsText: 'State',
        isSortable: false,
      },
      {
        id: 'status',
        schema: 'status',
        displayAsText: 'Status',
        isSortable: false,
      },
      {
        id: 'lastUpdatedTime',
        displayAsText: 'Last updated',
      },
      {
        id: 'id',
        displayAsText: 'ID',
        cellActions: [
          ({ rowIndex, isExpanded }) => {
            const textToCopy = versions[rowIndex].id;
            if (isExpanded) {
              return <ExpandCopyIDButton textToCopy={textToCopy} />;
            }
            return (
              <EuiCopy textToCopy={textToCopy} beforeMessage="Copy ID" afterMessage="Copied">
                {(copy) => (
                  <EuiIcon
                    role="button"
                    aria-label="Copy ID"
                    style={{ cursor: 'pointer' }}
                    onClick={copy}
                    type="copy"
                  />
                )}
              </EuiCopy>
            );
          },
        ],
      },
      ...tags.map((tag) => ({
        id: `tags.${tag}`,
        displayAsText: `Tag: ${tag}`,
      })),
    ],
    [tags, versions]
  );
  const trailingControlColumns = useMemo(
    () => [
      {
        id: 'actions',
        width: 40,
        headerCellRender: () => null,
        rowCellRender: ({ rowIndex }: EuiDataGridCellValueElementProps) => {
          const { id, name, version, state } = versions[rowIndex];
          return (
            <ModelVersionTableRowActions id={id} name={name} state={state} version={version} />
          );
        },
      },
    ],
    [versions]
  );
  const [visibleColumns, setVisibleColumns] = useState(() => {
    const tagHiddenByDefaultColumns = tags.slice(3);
    return columns
      .map(({ id }) => id)
      .filter((columnId) => {
        if (columnId.startsWith('tags.')) {
          const [_prefix, tag] = columnId.split('.');
          return !tagHiddenByDefaultColumns.includes(tag);
        }
        return columnId !== 'id';
      });
  });
  const columnVisibility = useMemo(() => ({ visibleColumns, setVisibleColumns }), [visibleColumns]);

  const renderCellValue = useCallback(
    ({ rowIndex, columnId, isDetails }) => (
      <ModelVersionCell data={versions[rowIndex]} columnId={columnId} isDetails={isDetails} />
    ),
    [versions]
  );

  return (
    <div>
      <EuiDataGrid
        aria-label="Model versions"
        columns={columns}
        columnVisibility={columnVisibility}
        trailingControlColumns={trailingControlColumns}
        rowCount={versions.length}
        sorting={sorting}
        renderCellValue={renderCellValue}
        // Fix data grid height shrink or expand after versions length change
        key={`${versions.length}`}
      />
      {pagination && typeof totalVersionCount === 'number' && (
        <div className="euiDataGrid__pagination">
          <EuiTablePagination
            activePage={pagination.pageIndex}
            itemsPerPage={pagination.pageSize}
            itemsPerPageOptions={pagination.pageSizeOptions}
            pageCount={Math.ceil(totalVersionCount / pagination.pageSize)}
            onChangePage={pagination.onChangePage}
            onChangeItemsPerPage={pagination.onChangeItemsPerPage}
          />
        </div>
      )}
    </div>
  );
};
