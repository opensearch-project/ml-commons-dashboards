/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiPanel,
  EuiTitle,
  EuiText,
  EuiSpacer,
  EuiCopy,
  EuiIcon,
} from '@elastic/eui';
import { renderTime } from '../../utils';

interface Props {
  description?: string;
  createdTime?: number;
  lastUpdatedTime?: number;
  modelId?: string;
}

export const ModelVersionDetails = ({
  description,
  createdTime,
  lastUpdatedTime,
  modelId,
}: Props) => {
  return (
    <EuiPanel>
      <EuiTitle size="xs">
        <h4>Model description</h4>
      </EuiTitle>
      <EuiText size="s" style={{ maxWidth: 1000 }}>
        {description || '-'}
      </EuiText>
      <EuiSpacer size="l" />
      <EuiTitle size="xs">
        <h4>Version notes</h4>
      </EuiTitle>
      <EuiText size="s" style={{ maxWidth: 1000 }}>
        TODO
      </EuiText>
      <EuiSpacer size="l" />
      <EuiFlexGroup>
        <EuiFlexItem style={{ maxWidth: 250 }}>
          <EuiTitle size="xs">
            <h4>Owner</h4>
          </EuiTitle>
          <EuiText size="s">TODO</EuiText>
        </EuiFlexItem>
        <EuiFlexItem style={{ maxWidth: 250 }}>
          <EuiTitle size="xs">
            <h4>Created</h4>
          </EuiTitle>
          <EuiText size="s">
            {createdTime ? renderTime(createdTime, 'MMM d, yyyy @ HH:mm:ss.SSS') : '-'}
          </EuiText>
        </EuiFlexItem>
        <EuiFlexItem style={{ maxWidth: 250 }}>
          <EuiTitle size="xs">
            <h4>Last updated</h4>
          </EuiTitle>
          <EuiText size="s">
            {lastUpdatedTime ? renderTime(lastUpdatedTime, 'MMM d, yyyy @ HH:mm:ss.SSS') : '-'}
          </EuiText>
        </EuiFlexItem>
        <EuiFlexItem style={{ maxWidth: 250 }}>
          <EuiTitle size="xs">
            <h4>ID</h4>
          </EuiTitle>
          <EuiCopy textToCopy={modelId ?? ''} beforeMessage="Copy model ID">
            {(copy) => (
              <EuiText size="s" onClick={copy}>
                {modelId ?? '-'} <EuiIcon type="copy" />
              </EuiText>
            )}
          </EuiCopy>
        </EuiFlexItem>
      </EuiFlexGroup>
    </EuiPanel>
  );
};
