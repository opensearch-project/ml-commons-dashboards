/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useEffect, useCallback } from 'react';
import {
  EuiFlyout,
  EuiFlyoutBody,
  EuiFlyoutHeader,
  EuiTitle,
  EuiDescriptionList,
  EuiDescriptionListTitle,
  EuiDescriptionListDescription,
  EuiSpacer,
} from '@elastic/eui';
import { APIProvider } from '../../apis/api_provider';
import { ModelDeploymentProfile } from '../../apis/profile';
import { useFetcher } from '../../hooks/use_fetcher';
import { NodesTable } from './nodes_table';
import { CopyableText } from '../common';

export interface INode {
  id: string;
  deployed: boolean;
}

export interface PreviewModel {
  name: string;
  id: string;
}

interface Props {
  onClose: () => void;
  model: PreviewModel;
  onUpdateData: (data: ModelDeploymentProfile) => void;
}

export const PreviewPanel = ({ onClose, model, onUpdateData }: Props) => {
  const { id, name } = model;
  const { data } = useFetcher(APIProvider.getAPI('profile').getSpecificModel, id);
  const nodes = useMemo(() => {
    const targetNodes = data?.target_node_ids ?? [],
      deployedNodes = data?.deployed_node_ids ?? [];
    return targetNodes.map((item) => ({
      id: item,
      deployed: deployedNodes.indexOf(item) > -1 ? true : false,
    }));
  }, [data]);

  const defineRespondingStatus = useCallback(() => {
    const deployedNodesNum = data?.deployed_node_ids?.length ?? 0,
      targetNodesNum = data?.target_node_ids?.length ?? 0;
    if (deployedNodesNum < targetNodesNum) {
      return `Partially responding on ${deployedNodesNum} of ${targetNodesNum} nodes`;
    } else if (deployedNodesNum === 0) {
      return `Not responding on ${deployedNodesNum} of ${targetNodesNum} nodes`;
    } else {
      return `Responding on ${deployedNodesNum} of ${targetNodesNum} nodes`;
    }
  }, [data]);

  useEffect(() => {
    data && onUpdateData(data);
  }, [data]);

  return (
    <EuiFlyout onClose={onClose}>
      <EuiFlyoutHeader>
        <EuiTitle size="s">
          <h3>{name}</h3>
        </EuiTitle>
      </EuiFlyoutHeader>
      <EuiFlyoutBody>
        <EuiDescriptionList>
          <EuiDescriptionListTitle>Model ID</EuiDescriptionListTitle>
          <EuiDescriptionListDescription>
            <CopyableText text={id} iconLeft={false} />
          </EuiDescriptionListDescription>
          <EuiDescriptionListTitle>Model status by node</EuiDescriptionListTitle>
          <EuiDescriptionListDescription>{defineRespondingStatus()}</EuiDescriptionListDescription>
        </EuiDescriptionList>
        <EuiSpacer />
        {nodes.length > 0 ? <NodesTable nodes={nodes} /> : null}
      </EuiFlyoutBody>
    </EuiFlyout>
  );
};
