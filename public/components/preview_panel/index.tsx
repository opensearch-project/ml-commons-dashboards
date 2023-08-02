/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useCallback } from 'react';
import {
  EuiFlyout,
  EuiFlyoutBody,
  EuiFlyoutHeader,
  EuiTitle,
  EuiHealth,
  EuiDescriptionList,
  EuiDescriptionListTitle,
  EuiDescriptionListDescription,
  EuiSpacer,
  EuiTextColor,
} from '@elastic/eui';
import { APIProvider } from '../../apis/api_provider';
import { useFetcher } from '../../hooks/use_fetcher';
import { NodesTable } from './nodes_table';
import { CopyableText } from '../common';
import { ModelDeploymentProfile } from '../../apis/profile';

export interface INode {
  id: string;
  deployed: boolean;
}

export interface PreviewModel {
  name: string;
  id: string;
  planningWorkerNodes: string[];
  source: string;
}

interface Props {
  onClose: (data: ModelDeploymentProfile | null) => void;
  model: PreviewModel;
}

export const PreviewPanel = ({ onClose, model }: Props) => {
  const { id, name, source } = model;
  const { data, loading } = useFetcher(APIProvider.getAPI('profile').getModel, id);
  const nodes = useMemo(() => {
    if (loading) {
      return [];
    }
    const targetNodes = data?.target_worker_nodes ?? model.planningWorkerNodes ?? [];
    const deployedNodes = data?.worker_nodes ?? [];
    return targetNodes.map((item) => ({
      id: item,
      deployed: deployedNodes.indexOf(item) > -1 ? true : false,
    }));
  }, [data, model, loading]);

  const respondingStatus = useMemo(() => {
    if (loading) {
      return (
        <EuiTextColor color="subdued" data-test-subj="preview-panel-color-loading-text">
          Loading...
        </EuiTextColor>
      );
    }
    const deployedNodesNum = nodes.filter(({ deployed }) => deployed).length;
    const targetNodesNum = nodes.length;
    if (deployedNodesNum === 0) {
      return (
        <EuiHealth className="ml-modelStatusCell" color="danger">
          Not responding on {targetNodesNum} of {targetNodesNum} nodes
        </EuiHealth>
      );
    }
    if (deployedNodesNum < targetNodesNum) {
      return (
        <EuiHealth className="ml-modelStatusCell" color="warning">
          Partially responding on {deployedNodesNum} of {targetNodesNum} nodes
        </EuiHealth>
      );
    }
    return (
      <EuiHealth className="ml-modelStatusCell" color="success">
        Responding on {deployedNodesNum} of {targetNodesNum} nodes
      </EuiHealth>
    );
  }, [nodes, loading]);

  const onCloseFlyout = useCallback(() => {
    onClose(data);
  }, [onClose, data]);

  return (
    <EuiFlyout onClose={onCloseFlyout}>
      <EuiFlyoutHeader>
        <EuiTitle size="s">
          <h3>{name}</h3>
        </EuiTitle>
      </EuiFlyoutHeader>
      <EuiFlyoutBody>
        <EuiDescriptionList>
          <EuiDescriptionListTitle style={{ fontSize: '14px' }}>Model ID</EuiDescriptionListTitle>
          <EuiDescriptionListDescription>
            <CopyableText text={id} iconLeft={false} tooltipText="Copy model ID" />
          </EuiDescriptionListDescription>
          <EuiDescriptionListTitle style={{ fontSize: '14px' }}>Source</EuiDescriptionListTitle>
          <EuiDescriptionListDescription>{source}</EuiDescriptionListDescription>
          <EuiDescriptionListTitle style={{ fontSize: '14px' }}>
            Model status by node
          </EuiDescriptionListTitle>
          <EuiDescriptionListDescription>{respondingStatus}</EuiDescriptionListDescription>
        </EuiDescriptionList>
        <EuiSpacer />
        <NodesTable loading={loading} nodes={nodes} />
      </EuiFlyoutBody>
    </EuiFlyout>
  );
};
