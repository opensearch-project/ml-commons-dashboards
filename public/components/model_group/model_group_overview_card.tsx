/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiDescriptionList, EuiFlexGroup, EuiFlexItem, EuiPanel, EuiSpacer } from '@elastic/eui';
import React from 'react';
import { CopyableText } from '../common';
import { renderTime } from '../../utils';

interface ModelGroupOverviewCardProps {
  id: string;
  description?: string;
  owner: string;
  isModelOwner: boolean;
  createdTime: number;
  updatedTime: number;
}

export const ModelGroupOverviewCard = ({
  id,
  owner,
  createdTime,
  updatedTime,
  description,
  isModelOwner,
}: ModelGroupOverviewCardProps) => {
  return (
    <EuiPanel data-test-subj="model-group-overview-card">
      <EuiSpacer size="m" />
      <EuiDescriptionList
        style={{ maxWidth: 1000 }}
        listItems={[
          {
            title: 'Description',
            description: description || '',
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
                description: renderTime(createdTime, 'MMM D, YYYY H:m A'),
              },
            ]}
          />
        </EuiFlexItem>
        <EuiFlexItem>
          <EuiDescriptionList
            listItems={[
              {
                title: 'Last updated',
                description: renderTime(updatedTime, 'MMM D, YYYY H:m A'),
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
