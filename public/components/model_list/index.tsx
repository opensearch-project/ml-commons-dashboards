/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback, useMemo, useRef } from 'react';
import { EuiPageHeader, EuiButton, EuiSpacer, EuiPanel } from '@elastic/eui';
import { Link } from 'react-router-dom';
import moment from 'moment';

import { CoreStart } from '../../../../../src/core/public';
import { APIProvider } from '../../apis/api_provider';
import { routerPaths } from '../../../common/router_paths';
import { useFetcher } from '../../hooks/use_fetcher';

import { ModelTable } from './model_table';
import { ModelListFilter } from './model_list_filter';
import {
  ModelConfirmDeleteModal,
  ModelConfirmDeleteModalInstance,
} from './model_confirm_delete_modal';

export const ModelList = ({ notifications }: { notifications: CoreStart['notifications'] }) => {
  const confirmModelDeleteRef = useRef<ModelConfirmDeleteModalInstance>(null);
  const [params, setParams] = useState<{
    algorithms?: string[];
    context?: { [key: string]: Array<string | number> };
    trainedStart?: moment.Moment | null;
    trainedEnd?: moment.Moment | null;
    sort: 'trainTime-desc' | 'trainTime-asc';
    currentPage: number;
    pageSize: number;
  }>({
    currentPage: 1,
    pageSize: 15,
    sort: 'trainTime-desc',
  });
  const { data, reload } = useFetcher(APIProvider.getAPI('model').search, {
    ...params,
    sort: [params.sort],
    trainedStart: params.trainedStart?.valueOf(),
    trainedEnd: params.trainedEnd?.valueOf(),
  });
  const models = useMemo(() => data?.data || [], [data]);
  const totalModelCounts = data?.pagination.totalRecords || 0;

  const pagination = useMemo(
    () => ({
      currentPage: params.currentPage,
      pageSize: params.pageSize,
      totalRecords: totalModelCounts,
    }),
    [totalModelCounts, params.currentPage, params.pageSize]
  );

  const handleModelDeleted = useCallback(async () => {
    reload();
    notifications.toasts.addSuccess('Model has been deleted.');
  }, [reload, notifications.toasts]);

  const handleAlgorithmsChange = useCallback(
    (algorithms: string | undefined) => {
      setParams((previousValue) => ({
        ...previousValue,
        algorithms: algorithms ? [algorithms] : undefined,
        context: undefined,
      }));
    },
    [setParams]
  );

  const handleContextChange = useCallback((context) => {
    setParams((previousValue) => ({ ...previousValue, context }));
  }, []);

  const handleTrainedStartChange = useCallback((date: moment.Moment | null) => {
    setParams((previousValue) => ({ ...previousValue, trainedStart: date }));
  }, []);

  const handleTrainedEndChange = useCallback((date: moment.Moment | null) => {
    setParams((previousValue) => ({ ...previousValue, trainedEnd: date }));
  }, []);

  const handleModelDelete = useCallback((modelId: string) => {
    confirmModelDeleteRef.current?.show(modelId);
  }, []);

  const handleTableChange = useCallback((criteria) => {
    const {
      pagination: { currentPage, pageSize },
      sort,
    } = criteria;
    setParams((previousValue) => {
      if (
        currentPage === previousValue.currentPage &&
        pageSize === previousValue.pageSize &&
        (!sort || sort === previousValue.sort)
      ) {
        return previousValue;
      }
      return {
        ...previousValue,
        currentPage,
        pageSize,
        ...(sort ? { sort } : {}),
      };
    });
  }, []);

  return (
    <EuiPanel>
      <EuiPageHeader
        pageTitle={
          <>
            Models
            {totalModelCounts !== undefined && (
              <span style={{ fontSize: '0.6em', verticalAlign: 'middle', paddingLeft: 4 }}>
                ({totalModelCounts})
              </span>
            )}
          </>
        }
        rightSideItems={[
          <Link to={routerPaths.train}>
            <EuiButton fill>Train new model</EuiButton>
          </Link>,
        ]}
        bottomBorder
      />
      <EuiSpacer />
      <ModelListFilter
        context={params.context}
        algorithm={params.algorithms?.[0]}
        onContextChange={handleContextChange}
        onAlgorithmsChange={handleAlgorithmsChange}
        trainedStart={params.trainedStart}
        trainedEnd={params.trainedEnd}
        onTrainedStartChange={handleTrainedStartChange}
        onTrainedEndChange={handleTrainedEndChange}
      />
      <EuiSpacer />
      <ModelTable
        models={models}
        sort={params.sort}
        pagination={pagination}
        onModelDelete={handleModelDelete}
        onChange={handleTableChange}
      />
      <ModelConfirmDeleteModal ref={confirmModelDeleteRef} onDeleted={handleModelDeleted} />
    </EuiPanel>
  );
};
