/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState, useCallback, useEffect, useRef } from 'react';
import {
  EuiButton,
  EuiButtonEmpty,
  EuiDataGridSorting,
  EuiEmptyPrompt,
  EuiFlexGroup,
  EuiFlexItem,
  EuiIcon,
  EuiLink,
  EuiLoadingSpinner,
  EuiPanel,
  EuiSpacer,
  EuiText,
  EuiTextColor,
  EuiTitle,
} from '@elastic/eui';
import { generatePath } from 'react-router-dom';

import { useFetcher } from '../../../hooks';
import { APIProvider } from '../../../apis/api_provider';
import { MODEL_VERSION_STATE, routerPaths } from '../../../../common';
import { useOpenSearchDashboards } from '../../../../../../src/plugins/opensearch_dashboards_react/public';

import { ModelVersionTable } from './model_version_table';
import { ModelVersionListFilter, ModelVersionListFilterValue } from './model_version_list_filter';

// TODO: Use tags from model group
const tags = ['Tag1', 'Tag2'];
const emptyPromptStyle = { maxWidth: 528 };

const modelState2StatusMap: {
  [key in MODEL_VERSION_STATE]?: ModelVersionListFilterValue['status'][number];
} = {
  [MODEL_VERSION_STATE.deploying]: 'InProgress',
  [MODEL_VERSION_STATE.registering]: 'InProgress',
  [MODEL_VERSION_STATE.registered]: 'Success',
  [MODEL_VERSION_STATE.deployed]: 'Success',
  [MODEL_VERSION_STATE.undeployed]: 'Success',
  [MODEL_VERSION_STATE.partiallyDeployed]: 'Warning',
  [MODEL_VERSION_STATE.deployFailed]: 'Error',
  [MODEL_VERSION_STATE.registerFailed]: 'Error',
};

const getStatesParam = ({
  status: statuses,
  state: states,
}: Pick<ModelVersionListFilterValue, 'status' | 'state'>) => {
  if (statuses.length === 0 && states.length === 0) {
    return undefined;
  }
  return [
    MODEL_VERSION_STATE.deploying,
    MODEL_VERSION_STATE.registering,
    MODEL_VERSION_STATE.registered,
    MODEL_VERSION_STATE.deployed,
    MODEL_VERSION_STATE.partiallyDeployed,
    MODEL_VERSION_STATE.deployFailed,
    MODEL_VERSION_STATE.registerFailed,
  ].filter((modelState) => {
    const stateRelatedStatus = modelState2StatusMap[modelState];
    if (stateRelatedStatus && statuses.includes(stateRelatedStatus)) {
      return true;
    }
    if (
      modelState === MODEL_VERSION_STATE.deployed ||
      modelState === MODEL_VERSION_STATE.partiallyDeployed
    ) {
      return states.includes('Deployed');
    }
    return states.includes('Not deployed');
  });
};

const getSortParam = (sort: Array<{ id: string; direction: 'asc' | 'desc' }>) => {
  const id2fieldMap: { [key: string]: string } = {
    lastUpdatedTime: 'last_updated_time',
  };
  return sort.length > 0
    ? sort.map(({ id, direction }) => `${id2fieldMap[id] || id}-${direction}`)
    : undefined;
};

interface ModelVersionsPanelProps {
  modelId: string;
}

export const ModelVersionsPanel = ({ modelId }: ModelVersionsPanelProps) => {
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const [params, setParams] = useState<{
    pageIndex: number;
    pageSize: number;
    sort: Array<{ id: string; direction: 'asc' | 'desc' }>;
    filter: ModelVersionListFilterValue;
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
  const { data: versionsData, reload, loading, error } = useFetcher(
    APIProvider.getAPI('modelVersion').search,
    {
      modelIds: [modelId],
      from: params.pageIndex * params.pageSize,
      size: params.pageSize,
      states: getStatesParam(params.filter),
      versionOrKeyword: params.filter.search,
      sort: getSortParam(params.sort),
    }
  );
  const totalVersionCount = versionsData?.total_model_versions;
  const { notifications } = useOpenSearchDashboards();

  const versions = useMemo(() => {
    if (!versionsData) {
      return [];
    }
    return versionsData.data.map((item) => ({
      id: item.id,
      name: item.name,
      version: item.model_version,
      state: item.model_state,
      lastUpdatedTime: item.last_updated_time,
      // TODO: Change to use tags in model version once structure finalized
      tags: {},
      createdTime: item.created_time,
      lastRegisteredTime: item.last_registered_time,
      lastDeployedTime: item.last_deployed_time,
      lastUndeployedTime: item.last_undeployed_time,
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

  const versionsSorting = useMemo<EuiDataGridSorting>(
    () => ({
      columns: params.sort,
      onSort: (sort) => {
        setParams((previousParams) => ({
          ...previousParams,
          sort: sort.filter(
            (item) => !previousParams.sort.find((previousItem) => previousItem.id === item.id)
          ),
        }));
      },
    }),
    [params]
  );

  const panelStatus = useMemo(() => {
    if (loading) {
      return 'loading';
    }
    if (error) {
      return 'error';
    }
    const { tag, state, status, search } = params.filter;
    if (
      totalVersionCount === 0 &&
      (tag.length > 0 || state.length > 0 || status.length > 0 || !!search)
    ) {
      return 'no-result';
    }
    if (totalVersionCount === 0) {
      return 'empty';
    }
    return 'normal';
  }, [totalVersionCount, loading, error, params]);

  const handleFilterChange = useCallback((filter: ModelVersionListFilterValue) => {
    setParams((previousParams) => ({ ...previousParams, pageIndex: 0, filter }));
  }, []);

  const handleResetSearch = useCallback(() => {
    setParams((previousParams) => ({
      ...previousParams,
      filter: { tag: [], state: [], status: [] },
    }));
    if (searchInputRef.current) {
      searchInputRef.current.value = '';
    }
  }, []);

  const bindSearchInputSearch = useCallback((input: HTMLInputElement | null) => {
    if (searchInputRef) {
      searchInputRef.current = input;
    }
  }, []);

  useEffect(() => {
    if (error) {
      notifications.toasts.danger({
        title: 'Failed to load data',
        body: 'Check your internet connection.',
      });
    }
  }, [error, notifications.toasts]);

  return (
    <EuiPanel style={{ padding: 20 }}>
      <EuiFlexGroup>
        <EuiFlexItem>
          <EuiTitle size="s">
            <h3>
              Versions
              {typeof totalVersionCount === 'number' && panelStatus !== 'empty' && (
                <EuiTextColor color="subdued">&nbsp;({totalVersionCount})</EuiTextColor>
              )}
            </h3>
          </EuiTitle>
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiButton onClick={reload}>Refresh</EuiButton>
        </EuiFlexItem>
      </EuiFlexGroup>
      {panelStatus !== 'empty' && (
        <ModelVersionListFilter
          value={params.filter}
          onChange={handleFilterChange}
          searchInputRef={bindSearchInputSearch}
        />
      )}
      <EuiSpacer size="m" />
      {(panelStatus === 'normal' || panelStatus === 'no-result') && (
        <ModelVersionTable
          versions={versions}
          tags={tags}
          pagination={pagination}
          totalVersionCount={totalVersionCount}
          sorting={versionsSorting}
        />
      )}
      {panelStatus === 'loading' && (
        <EuiEmptyPrompt
          style={emptyPromptStyle}
          body={
            <>
              <EuiSpacer size="l" />
              <EuiLoadingSpinner size="xl" />
              <EuiSpacer size="s" />
              <EuiTitle>
                <h2 style={{ marginTop: 0, marginBottom: 0, paddingBottom: 72 }}>
                  Loading versions
                </h2>
              </EuiTitle>
            </>
          }
        />
      )}
      {panelStatus === 'error' && (
        <EuiEmptyPrompt
          style={emptyPromptStyle}
          body={
            <>
              <EuiSpacer size="l" />
              <EuiIcon size="xl" color="danger" type="alert" />
              <EuiSpacer size="s" />
              <EuiTitle>
                <h2 style={{ marginTop: 0, marginBottom: 0 }}>Failed to load versions</h2>
              </EuiTitle>
              <EuiSpacer size="m" />
              <EuiText color="subdued">Check your internet connection</EuiText>
              <EuiSpacer size="xl" />
              <EuiSpacer size="l" />
            </>
          }
        />
      )}
      {panelStatus === 'no-result' && (
        <EuiEmptyPrompt
          style={emptyPromptStyle}
          body={
            <>
              <EuiSpacer size="xxl" />
              <EuiText color="subdued">
                There are no results for your search. Reset the search criteria to view registered
                versions.
              </EuiText>
              <EuiSpacer size="xl" />
              <EuiButton onClick={handleResetSearch}>Reset search criteria</EuiButton>
              <EuiSpacer size="l" />
            </>
          }
        />
      )}
      {panelStatus === 'empty' && (
        <EuiEmptyPrompt
          style={emptyPromptStyle}
          body={
            <>
              <EuiSpacer size="xxl" />
              <EuiText color="subdued">Registered versions will appear here.</EuiText>
              <EuiSpacer size="xl" />
              <EuiLink href={generatePath(routerPaths.registerModel, { id: modelId })}>
                <EuiButton iconType="plusInCircle">Register new version</EuiButton>
              </EuiLink>
              <EuiSpacer size="m" />
              {/* TODO: Update to real link after confirmed */}
              <EuiButtonEmpty href="/todo" iconType="popout" iconSide="right">
                Read documentation
              </EuiButtonEmpty>
              <EuiSpacer size="l" />
            </>
          }
        />
      )}
    </EuiPanel>
  );
};
