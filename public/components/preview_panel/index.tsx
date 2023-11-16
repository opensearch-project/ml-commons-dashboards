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
  EuiFlexGroup,
  EuiFlexItem,
} from '@elastic/eui';
import { APIProvider } from '../../apis/api_provider';
import { useFetcher } from '../../hooks/use_fetcher';
import { NodesTable } from './nodes_table';
import { CopyableText } from '../common';
import { ModelDeploymentProfile } from '../../apis/profile';
import { ConnectorDetails } from './connector_details';

export interface INode {
  id: string;
  deployed: boolean;
}

export interface PreviewModel {
  name: string;
  id: string;
  planningWorkerNodes: string[];
  connector?: {
    id?: string;
    name?: string;
    description?: string;
  };
}

interface Props {
  onClose: (data: ModelDeploymentProfile | null) => void;
  model: PreviewModel;
}

export const PreviewPanel = ({ onClose, model }: Props) => {
  const { id, name, connector } = model;
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
      return {
        overall: (
          <EuiTextColor color="subdued" data-test-subj="preview-panel-color-loading-text">
            Loading...
          </EuiTextColor>
        ),
        nodes: 'Loading...',
      };
    }
    const deployedNodesNum = nodes.filter(({ deployed }) => deployed).length;
    const targetNodesNum = nodes.length;
    if (deployedNodesNum === 0) {
      return {
        overall: (
          <EuiHealth className="ml-modelStatusCell" color="danger">
            Not responding
          </EuiHealth>
        ),
        nodes: `Not responding on ${targetNodesNum} of ${targetNodesNum} nodes`,
      };
    }
    if (deployedNodesNum < targetNodesNum) {
      return {
        overall: (
          <EuiHealth className="ml-modelStatusCell" color="warning">
            Partially responding
          </EuiHealth>
        ),
        nodes: `Responding on ${deployedNodesNum} of ${targetNodesNum} nodes`,
      };
    }
    return {
      overall: (
        <EuiHealth className="ml-modelStatusCell" color="success">
          Responding
        </EuiHealth>
      ),
      nodes: `Responding on ${deployedNodesNum} of ${targetNodesNum} nodes`,
    };
  }, [nodes, loading]);

  const onCloseFlyout = useCallback(() => {
    onClose(data);
  }, [onClose, data]);

  return (
    <EuiFlyout onClose={onCloseFlyout}>
      <EuiFlyoutHeader hasBorder>
        <EuiTitle size="m">
          <h2>{name}</h2>
        </EuiTitle>
      </EuiFlyoutHeader>
      <EuiFlyoutBody>
        <EuiDescriptionList compressed>
          <EuiFlexGroup>
            <EuiFlexItem>
              <EuiDescriptionListTitle>Status</EuiDescriptionListTitle>
              <EuiDescriptionListDescription>
                {respondingStatus.overall}
              </EuiDescriptionListDescription>
            </EuiFlexItem>
            <EuiFlexItem>
              <EuiDescriptionListTitle>Source</EuiDescriptionListTitle>
              <EuiDescriptionListDescription>
                {connector ? 'External' : 'Local'}
              </EuiDescriptionListDescription>
            </EuiFlexItem>
          </EuiFlexGroup>
          <EuiSpacer size="m" />
          <EuiDescriptionListTitle>Model ID</EuiDescriptionListTitle>
          <EuiDescriptionListDescription>
            <CopyableText text={id} iconLeft={false} tooltipText="Copy model ID" />
          </EuiDescriptionListDescription>
        </EuiDescriptionList>
        {connector ? (
          <ConnectorDetails
            id={connector.id}
            name={connector.name}
            description={connector.description}
          />
        ) : (
          <NodesTable loading={loading} nodes={nodes} nodesStatus={respondingStatus.nodes} />
        )}
      </EuiFlyoutBody>
    </EuiFlyout>
  );
};
