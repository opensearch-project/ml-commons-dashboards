/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useMemo, useState, useRef, useEffect } from 'react';
import { useRouteMatch, generatePath, useHistory } from 'react-router-dom';
import {
  EuiPanel,
  EuiPageHeader,
  EuiDescriptionList,
  EuiSpacer,
  EuiLoadingSpinner,
  EuiButton,
  EuiSelect,
} from '@elastic/eui';
import moment from 'moment';
import { NodesModal } from './nodes_modal';

import { APIProvider } from '../../apis/api_provider';
import { routerPaths } from '../../../common/router_paths';
import { useFetcher } from '../../hooks/use_fetcher';
import { MODEL_STATE } from '../../../common/model';
import { usePollingUntil } from '../../hooks/use_polling_until';
import { EuiLinkButton } from '../common';
import { ModelProfile } from './model_profile';

import {
  ModelConfirmDeleteModal,
  ModelConfirmDeleteModalInstance,
} from '../model_list/model_confirm_delete_modal';
import { CoreStart } from '../../../../../src/core/public';
import { generateVersionList, VersionList } from '../../utils';

export class NoIdProvideError {}

export const ModelDetail = ({ notifications }: { notifications: CoreStart['notifications'] }) => {
  const confirmModelDeleteRef = useRef<ModelConfirmDeleteModalInstance>(null);
  const [loading, setLoading] = useState(false);
  const { params } = useRouteMatch<{ id: string }>();
  const history = useHistory();
  const { data: model } = useFetcher(APIProvider.getAPI('model').getOne, params.id);
  const [versionList, setVersionList] = useState<VersionList>([]);
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
  useEffect(() => {
    const name = model?.name;
    if (name) {
      const fn = async () => {
        const { data } = await APIProvider.getAPI('model').search({
          name,
          currentPage: 1,
          pageSize: 50,
        });
        setVersionList(generateVersionList(data));
      };
      fn();
    }
  }, [model]);

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
      const { task_id: taskId, status } = await APIProvider.getAPI('model').load(modelId);
      if (taskId && status === 'CREATED') {
        deleteIdRef.current = taskId;
        startPolling();
      } else {
        setLoading(false);
      }
    } catch (e) {
      setLoading(false);
    }
  }, [startPolling, model]);

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
  }, [state, handleUnLoad, handleLoad]);

  const handleDelete = useCallback(() => {
    if (model?.id) {
      confirmModelDeleteRef.current?.show(model.id);
    }
  }, [model]);

  const handleModelDeleted = useCallback(() => {
    notifications.toasts.addSuccess('Model has been deleted.');
    history.replace(routerPaths.modelList);
  }, [notifications.toasts, history]);

  const handleVersionChange = useCallback(
    (e) => {
      const newId = e.target.value;
      history.push(generatePath(routerPaths.modelDetail, { id: newId }));
    },
    [history]
  );

  return (
    <EuiPanel>
      <EuiPageHeader
        pageTitle="Model Detail"
        rightSideItems={[
          <EuiButton onClick={handleDelete} isLoading={loading}>
            Delete
          </EuiButton>,
          <EuiButton onClick={() => setModalVisible(true)} isLoading={loading}>
            {state === MODEL_STATE.loaded ? 'Unload' : 'Load'}
          </EuiButton>,
          <>
            {model?.name ? (
              <EuiLinkButton to={`${routerPaths.modelUpload}?name=${model.name}`}>
                Register new version
              </EuiLinkButton>
            ) : null}
          </>,
          <EuiButton>Edit</EuiButton>,
          <EuiLinkButton to={routerPaths.modelList}>Back to list</EuiLinkButton>,
          <>
            {versionList ? (
              <EuiSelect options={versionList} value={params.id} onChange={handleVersionChange} />
            ) : null}
          </>,
        ]}
        bottomBorder
      />
      <ModelProfile id={params.id} />

      <EuiSpacer />
      <ModelConfirmDeleteModal ref={confirmModelDeleteRef} onDeleted={handleModelDeleted} />

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
