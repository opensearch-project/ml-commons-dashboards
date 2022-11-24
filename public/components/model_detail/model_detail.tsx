/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useMemo, useState, useRef } from 'react';
import { useRouteMatch, Link, generatePath } from 'react-router-dom';
import {
  EuiPanel,
  EuiPageHeader,
  EuiDescriptionList,
  EuiSpacer,
  EuiLoadingSpinner,
  EuiButton,
} from '@elastic/eui';
import moment from 'moment';
import { NodesModal } from './nodes_modal';

import { APIProvider } from '../../apis/api_provider';
import { routerPaths } from '../../../common/router_paths';
import { useFetcher } from '../../hooks/use_fetcher';
import { MODEL_STATE } from '../../../common/model';
import { usePollingUntil } from '../../hooks/use_polling_until';

export class NoIdProvideError {}

export const ModelDetail = (props: any) => {
  const [loading, setLoading] = useState(false);
  const { params } = useRouteMatch<{ id: string }>();
  const { data: model } = useFetcher(APIProvider.getAPI('model').getOne, params.id);
  const initialState = useMemo(() => (model?.state ? model.state : ''), [model]);
  const [changedState, setChangedState] = useState('');
  const deleteIdRef = useRef<string>();
  const state = useMemo(() => (changedState ? changedState : initialState), [
    changedState,
    initialState,
  ]);
  const [modalVisible, setModalVisible] = useState(false);
  const modelDescriptionListItems = useMemo(
    () =>
      model
        ? [
            {
              title: 'ID',
              description: model.id,
            },
            {
              title: 'Name',
              description: model.name,
            },
            {
              title: 'Algorithm',
              description: model.algorithm,
            },
            {
              title: 'State',
              description: state,
            },
            ...(model.trainTime
              ? [
                  {
                    title: 'Train time',
                    description: moment(model.trainTime).format(),
                  },
                ]
              : []),
            {
              title: 'Context',
              description: JSON.stringify(model.context),
            },
            {
              title: 'Content',
              description: <div style={{ wordBreak: 'break-all' }}>{model.content}</div>,
            },
          ]
        : [],
    [model, state]
  );

  const { start: startPolling } = usePollingUntil({
    continueChecker: async () => {
      if (!deleteIdRef.current) {
        throw new NoIdProvideError();
      }
      const { data } = await APIProvider.getAPI('task').search({
        ids: [deleteIdRef.current],
        pageSize: 1,
        currentPage: 1,
      });
      return data[0].state !== 'COMPLETED' && data[0].state !== 'FAILED';
    },
    onGiveUp: () => {
      setLoading(false);
      setChangedState(MODEL_STATE.loaded);
    },
    onMaxRetries: () => {
      setLoading(false);
    },
  });

  const handleLoad = useCallback(async () => {
    const modelId = model?.id;
    if (!modelId) return;
    setLoading(true);
    try {
      const { task_id, status } = await APIProvider.getAPI('model').load(modelId);
      if (task_id && status === 'CREATED') {
        deleteIdRef.current = task_id;
        startPolling();
      } else {
        setLoading(false);
      }
    } catch (e) {
      setLoading(false);
    }
  }, [model]);

  const handleUnLoad = useCallback(async () => {
    const modelId = model?.id;
    if (!modelId) return;
    setLoading(true);
    try {
      const result = await APIProvider.getAPI('model').unload(modelId);
      let unloaded = true;
      const nodes = Object.keys(result);
      nodes.forEach((node) => {
        if (result[node].stats[modelId] !== 'unloaded') {
          unloaded = false;
        }
      });
      if (unloaded) {
        setLoading(false);
        setChangedState(MODEL_STATE.unloaded);
      }
    } catch (e) {
      setLoading(false);
    }
  }, [model]);

  const handleConfirmNodes = useCallback(() => {
    setModalVisible(false);
    if (state === MODEL_STATE.loaded) {
      handleUnLoad();
    } else {
      handleLoad();
    }
  }, [state]);

  return (
    <EuiPanel>
      <EuiPageHeader
        pageTitle="Model Detail"
        rightSideItems={[
          <EuiButton fill onClick={() => setModalVisible(true)} isLoading={loading}>
            {state === MODEL_STATE.loaded ? 'Unload' : 'Load'}
          </EuiButton>,
          <Link to={generatePath(routerPaths.predict, { id: params.id })}>
            <EuiButton fill>Predict</EuiButton>
          </Link>,
          <Link to={routerPaths.modelList}>
            <EuiButton>Back to list</EuiButton>
          </Link>,
        ]}
        bottomBorder
      />
      <EuiSpacer />

      {model ? (
        <EuiDescriptionList listItems={modelDescriptionListItems} />
      ) : (
        <EuiLoadingSpinner size="xl" />
      )}
      {modalVisible && (
        <NodesModal
          onClose={() => {
            setModalVisible(false);
          }}
          onConfirm={handleConfirmNodes}
        />
      )}
    </EuiPanel>
  );
};
