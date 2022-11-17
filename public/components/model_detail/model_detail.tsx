/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useMemo, useState } from 'react';
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

import { APIProvider } from '../../apis/api_provider';
import { routerPaths } from '../../../common/router_paths';
import { useFetcher } from '../../hooks/use_fetcher';
import { MODEL_STATE } from '../../../common/model';

export const ModelDetail = (props: any) => {
  const [loading, setLoading] = useState(false);
  const { params } = useRouteMatch<{ id: string }>();
  const { data: model } = useFetcher(APIProvider.getAPI('model').getOne, params.id);

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
              description: model.state,
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
    [model]
  );

  const handleLoad = useCallback(async () => {
    const modelId = model?.id;
    if (!modelId) return;
    setLoading(true);
    try {
      const { task_id, status } = await APIProvider.getAPI('model').load(modelId);
      console.log('result', task_id, status);
      if (task_id && status === 'CREATED') {
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
      if (unloaded) setLoading(false);
    } catch (e) {
      setLoading(false);
    }
  }, [model]);

  return (
    <EuiPanel>
      <EuiPageHeader
        pageTitle="Model Detail"
        rightSideItems={[
          model?.state === MODEL_STATE.loaded ? (
            <EuiButton fill onClick={handleUnLoad} isLoading={loading}>
              UnLoad
            </EuiButton>
          ) : (
            <EuiButton fill onClick={handleLoad} isLoading={loading}>
              Load
            </EuiButton>
          ),
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
    </EuiPanel>
  );
};
