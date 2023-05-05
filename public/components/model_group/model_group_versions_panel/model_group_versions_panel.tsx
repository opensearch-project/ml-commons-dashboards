/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState, useCallback } from 'react';
import {
  EuiButton,
  EuiFlexGroup,
  EuiFlexItem,
  EuiPanel,
  EuiSpacer,
  EuiTextColor,
  EuiTitle,
} from '@elastic/eui';

import { useFetcher } from '../../../hooks';
import { APIProvider } from '../../../apis/api_provider';
import { MODEL_STATE } from '../../../../common';

import { ModelGroupVersionTable } from './model_group_version_table';
import {
  ModelGroupVersionListFilter,
  ModelGroupVersionListFilterValue,
} from './model_group_version_list_filter';

// TODO: Use tags from model group
const tags = ['Tag1', 'Tag2'];

const modelState2StatusMap: {
  [key in MODEL_STATE]?: ModelGroupVersionListFilterValue['status'][number];
} = {
  [MODEL_STATE.loading]: 'InProgress',
  [MODEL_STATE.uploading]: 'InProgress',
  [MODEL_STATE.uploaded]: 'Success',
  [MODEL_STATE.loaded]: 'Success',
  [MODEL_STATE.unloaded]: 'Success',
  [MODEL_STATE.partiallyLoaded]: 'Warning',
  [MODEL_STATE.loadFailed]: 'Error',
  [MODEL_STATE.registerFailed]: 'Error',
};

const getStatesParam = ({
  status: statuses,
  state: states,
}: Pick<ModelGroupVersionListFilterValue, 'status' | 'state'>) => {
  if (statuses.length === 0 && states.length === 0) {
    return undefined;
  }
  return [
    MODEL_STATE.loading,
    MODEL_STATE.uploading,
    MODEL_STATE.uploaded,
    MODEL_STATE.loaded,
    MODEL_STATE.partiallyLoaded,
    MODEL_STATE.loadFailed,
    MODEL_STATE.registerFailed,
  ].filter((modelState) => {
    const stateRelatedStatus = modelState2StatusMap[modelState];
    if (stateRelatedStatus && statuses.includes(stateRelatedStatus)) {
      return true;
    }
    if (modelState === MODEL_STATE.loaded || modelState === MODEL_STATE.partiallyLoaded) {
      return states.includes('Deployed');
    }
    return states.includes('Not deployed');
  });
};

interface ModelGroupVersionsPanelProps {
  groupId: string;
}

export const ModelGroupVersionsPanel = ({ groupId }: ModelGroupVersionsPanelProps) => {
  const [params, setParams] = useState<{
    pageIndex: number;
    pageSize: number;
    sort: Array<{ id: string; direction: 'asc' | 'desc' }>;
    filter: ModelGroupVersionListFilterValue;
  }>({
    pageIndex: 0,
    pageSize: 25,
    sort: [],
    filter: {
      state: [],
      status: [],
      tag: [],
    },
  });
  const { data: versionsData, reload } = useFetcher(APIProvider.getAPI('model').search, {
    // TODO: Change to model group id
    ids: [groupId],
    from: params.pageIndex * params.pageSize,
    size: params.pageSize,
    states: getStatesParam(params.filter),
  });
  const totalVersionCount = versionsData?.total_models;

  const versions = useMemo(() => {
    if (!versionsData) {
      return [];
    }
    return versionsData.data.map((item) => ({
      id: item.id,
      name: item.name,
      version: item.model_version,
      state: item.model_state,
      lastUpdated: item.last_updated_time,
      // TODO: Change to use tags in model version once structure finalized
      tags: {},
      createdTime: item.created_time,
    }));
  }, [versionsData]);

  const pagination = useMemo(() => {
    if (!totalVersionCount) {
      return undefined;
    }
    return {
      pageIndex: params.pageIndex,
      pageSize: params.pageSize,
      pageSizeOptions: [10, 25, 50],
      onChangeItemsPerPage: (pageSize: number) => {
        setParams((previousParams) => ({ ...previousParams, pageSize }));
      },
      onChangePage: (pageIndex: number) => {
        setParams((previousParams) => ({ ...previousParams, pageIndex }));
      },
    };
  }, [params.pageIndex, params.pageSize, totalVersionCount]);

  const versionsSorting = useMemo(
    () => ({
      columns: params.sort,
      onSort: (sort) => {
        setParams((previousParams) => ({ ...previousParams, sort }));
      },
    }),
    [params]
  );

  const handleFilterChange = useCallback((filter: ModelGroupVersionListFilterValue) => {
    setParams((previousParams) => ({ ...previousParams, filter }));
  }, []);

  return (
    <EuiPanel data-test-subj="modelGroupVersionsPanel" style={{ padding: 20 }}>
      <EuiFlexGroup>
        <EuiFlexItem>
          <EuiTitle size="s">
            <h3>
              Versions
              {typeof totalVersionCount === 'number' && (
                <EuiTextColor color="subdued">&nbsp;({totalVersionCount})</EuiTextColor>
              )}
            </h3>
          </EuiTitle>
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiButton onClick={reload}>Refresh</EuiButton>
        </EuiFlexItem>
      </EuiFlexGroup>
      <ModelGroupVersionListFilter value={params.filter} onChange={handleFilterChange} />
      <EuiSpacer />
      <ModelGroupVersionTable
        versions={versions}
        tags={tags}
        pagination={pagination}
        totalVersionCount={totalVersionCount}
        sorting={versionsSorting}
      />
    </EuiPanel>
  );
};
