/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useState, useMemo } from 'react';
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

export type NodesTableSort = 'id-desc' | 'id-asc';
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
  const [sort, setSort] = useState<NodesTableSort>('id-desc');

  const { data } = useFetcher(APIProvider.getAPI('profile').getSpecificModel, id);
  const nodes = useMemo(() => {
    return data?.target_node_ids.map((item) => ({
      id: item,
      deployed: data?.deployed_node_ids.indexOf(item) > -1 ? true : false,
    }));
  }, [data]);

  const handleTableChange = useCallback((criteria) => {
    const { sort } = criteria;
    setSort(sort);
  }, []);

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
          <EuiDescriptionListDescription>
            {`Partially responding on ${data?.deployed_node_ids.length ?? 0} of ${
              data?.target_node_ids.length ?? 0
            } nodes`}
          </EuiDescriptionListDescription>
        </EuiDescriptionList>
        <EuiSpacer />
        {nodes ? <NodesTable nodes={nodes} sort={sort} onChange={handleTableChange} /> : null}
      </EuiFlyoutBody>
    </EuiFlyout>
  );
};
