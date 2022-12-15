/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { useFetcher } from '../../hooks/use_fetcher';
import { APIProvider } from '../../apis/api_provider';
import { EuiFlexGroup, EuiFlexItem, EuiStat } from '@elastic/eui';

interface Props {
  id: string;
}
export const ModelProfile = ({ id }: Props) => {
  const { data } = useFetcher(APIProvider.getAPI('model').profile, id);
  const workerNodes = useMemo(() => {
    if (data?.nodes) {
      const { nodes } = data;
      const nodesList = Object.keys(nodes);
      if (nodesList[0]) {
        //TODO: ensure the api design consistent
        const worker_nodes = nodes[nodesList[0]].models?.[id]?.worker_nodes ?? [];
        return worker_nodes;
      }
    }
    return [];
  }, [data]);
  return (
    <EuiFlexGroup>
      <EuiFlexItem>
        <EuiStat title={workerNodes.length} description="Worker Nodes Amount" titleSize="l" />
      </EuiFlexItem>
      {workerNodes.length > 0 && (
        <EuiFlexItem>
          <EuiStat title={workerNodes.toString()} description="Worker Nodes Id" titleSize="m" />
        </EuiFlexItem>
      )}
    </EuiFlexGroup>
  );
};
