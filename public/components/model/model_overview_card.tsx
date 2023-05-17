/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiDescriptionList, EuiFlexGroup, EuiFlexItem, EuiPanel, EuiSpacer } from '@elastic/eui';
import React from 'react';
import { CopyableText } from '../common';
import { renderTime } from '../../utils';
import { useOpenSearchDashboards } from '../../../../../src/plugins/opensearch_dashboards_react/public';

interface ModelOverviewCardProps {
  id: string;
  description?: string;
  owner: string;
  isModelOwner: boolean;
  createdTime: number;
  updatedTime: number;
}

export const ModelOverviewCard = ({
  id,
  owner,
  createdTime,
  updatedTime,
  description,
  isModelOwner,
}: ModelOverviewCardProps) => {
  const {
    services: { uiSettings },
  } = useOpenSearchDashboards();
  const dateFormat = uiSettings?.get('dateFormat');

  return (
    <EuiPanel data-test-subj="model-group-overview-card">
      <EuiSpacer size="m" />
      <EuiDescriptionList
        style={{ maxWidth: 1000 }}
        listItems={[
          {
            title: 'Description',
            description: description || '-',
          },
        ]}
      />
      <EuiSpacer size="l" />
      <EuiFlexGroup gutterSize="m" style={{ maxWidth: 1060 }}>
        <EuiFlexItem>
          <EuiDescriptionList
            listItems={[
              {
                title: 'Owner',
                description: `${owner}${isModelOwner ? ' (you)' : ''}`,
              },
            ]}
          />
        </EuiFlexItem>
        <EuiFlexItem>
          <EuiDescriptionList
            listItems={[
              {
                title: 'Created',
                description: dateFormat ? renderTime(createdTime, dateFormat) : '-',
              },
            ]}
          />
        </EuiFlexItem>
        <EuiFlexItem>
          <EuiDescriptionList
            listItems={[
              {
                title: 'Last updated',
                description: dateFormat ? renderTime(updatedTime, dateFormat) : '-',
              },
            ]}
          />
        </EuiFlexItem>
        <EuiFlexItem>
          <EuiDescriptionList
            listItems={[
              {
                title: 'ID',
                description: <CopyableText text={id} tooltipText="Copy ID" iconLeft={false} />,
              },
            ]}
          />
        </EuiFlexItem>
      </EuiFlexGroup>
      <EuiSpacer size="m" />
    </EuiPanel>
  );
};
