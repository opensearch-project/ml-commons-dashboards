/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  EuiDescriptionList,
  EuiDescriptionListTitle,
  EuiTitle,
  EuiSpacer,
  EuiDescriptionListDescription,
  EuiFlexGroup,
  EuiFlexItem,
} from '@elastic/eui';
import { CopyableText } from '../common';

export const ConnectorDetails = (props: { name?: string; id?: string; description?: string }) => {
  const { name, id, description } = props;
  return (
    <>
      <EuiSpacer size="m" />
      <EuiTitle size="s">
        <h3>Connector details</h3>
      </EuiTitle>
      <EuiSpacer size="m" />
      <EuiDescriptionList compressed>
        <EuiFlexGroup>
          <EuiFlexItem>
            <EuiDescriptionListTitle>Connector name</EuiDescriptionListTitle>
            <EuiDescriptionListDescription>{name ? name : '\u2014'}</EuiDescriptionListDescription>
          </EuiFlexItem>
          <EuiFlexItem>
            <EuiDescriptionListTitle>Connector ID</EuiDescriptionListTitle>
            <EuiDescriptionListDescription>
              {id ? (
                <CopyableText text={id} iconLeft={false} tooltipText="Copy connector ID" />
              ) : (
                '\u2014'
              )}
            </EuiDescriptionListDescription>
          </EuiFlexItem>
        </EuiFlexGroup>
        <EuiSpacer size="m" />
        <EuiDescriptionListTitle>Connector description</EuiDescriptionListTitle>
        <EuiDescriptionListDescription>
          {description ? description : '\u2014'}
        </EuiDescriptionListDescription>
      </EuiDescriptionList>
    </>
  );
};
