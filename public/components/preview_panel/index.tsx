/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import {
  EuiFlyout,
  EuiFlyoutBody,
  EuiFlyoutHeader,
  EuiTitle,
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
}

export const PreviewPanel = ({ onClose, model }: Props) => {
  const { id, name } = model;
  const { data, loading } = useFetcher(APIProvider.getAPI('profile').getModel, id);
  const nodes = useMemo(() => {
    const targetNodes = data?.target_node_ids ?? [];
    const deployedNodes = data?.deployed_node_ids ?? [];
    return targetNodes.map((item) => ({
      id: item,
      deployed: deployedNodes.indexOf(item) > -1 ? true : false,
    }));
  }, [data]);

  const respondingStatus = useMemo(() => {
    if (loading) {
      return (
        <EuiTextColor color="subdued" data-test-subj="preview-panel-color-loading-text">
          Loading...
        </EuiTextColor>
      );
    }
    const deployedNodesNum = data?.deployed_node_ids?.length ?? 0;
    const targetNodesNum = data?.target_node_ids?.length ?? 0;
    if (deployedNodesNum < targetNodesNum) {
      return `Partially responding on ${deployedNodesNum} of ${targetNodesNum} nodes`;
    } else if (deployedNodesNum === 0) {
      return `Not responding on ${deployedNodesNum} of ${targetNodesNum} nodes`;
    } else {
      return `Responding on ${deployedNodesNum} of ${targetNodesNum} nodes`;
    }
  }, [data, loading]);

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
          <EuiDescriptionListDescription>{respondingStatus}</EuiDescriptionListDescription>
        </EuiDescriptionList>
        <EuiSpacer />
        <NodesTable loading={loading} nodes={nodes} />
      </EuiFlyoutBody>
    </EuiFlyout>
  );
};
