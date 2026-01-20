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
import { UiSettingDateFormatTime } from '../common';

interface Props {
  description?: string;
  createdTime?: number;
  lastUpdatedTime?: number;
  modelVersionId?: string;
  owner?: string;
  versionNotes?: string;
}

export const ModelVersionDetails = ({
  description,
  createdTime,
  lastUpdatedTime,
  modelVersionId,
  owner,
  versionNotes,
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
        {versionNotes ?? '-'}
      </EuiText>
      <EuiSpacer size="l" />
      <EuiFlexGroup>
        <EuiFlexItem style={{ maxWidth: 250 }}>
          <EuiTitle size="xs">
            <h4>Owner</h4>
          </EuiTitle>
          <EuiText size="s">{owner ?? '-'}</EuiText>
        </EuiFlexItem>
        <EuiFlexItem style={{ maxWidth: 250 }}>
          <EuiTitle size="xs">
            <h4>Created</h4>
          </EuiTitle>
          <EuiText size="s">
            <UiSettingDateFormatTime time={createdTime} />
          </EuiText>
        </EuiFlexItem>
        <EuiFlexItem style={{ maxWidth: 250 }}>
          <EuiTitle size="xs">
            <h4>Last updated</h4>
          </EuiTitle>
          <EuiText size="s">
            <UiSettingDateFormatTime time={lastUpdatedTime} />
          </EuiText>
        </EuiFlexItem>
        <EuiFlexItem style={{ maxWidth: 250 }}>
          <EuiTitle size="xs">
            <h4>ID</h4>
          </EuiTitle>
          <EuiCopy textToCopy={modelVersionId ?? ''} beforeMessage="Copy model ID">
            {(copy) => (
              <EuiText size="s" onClick={copy}>
                {modelVersionId ?? '-'} <EuiIcon type="copy" />
              </EuiText>
            )}
          </EuiCopy>
        </EuiFlexItem>
      </EuiFlexGroup>
    </EuiPanel>
  );
};
