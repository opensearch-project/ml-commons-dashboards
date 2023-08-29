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
      <EuiDescriptionList>
        <EuiFlexGroup>
          <EuiFlexItem>
            <EuiDescriptionListTitle>
              <EuiTitle size="xxs">
                <h5>Connector name</h5>
              </EuiTitle>
            </EuiDescriptionListTitle>
            <EuiDescriptionListDescription>{name}</EuiDescriptionListDescription>
          </EuiFlexItem>
          <EuiFlexItem>
            <EuiDescriptionListTitle>
              <EuiTitle size="xxs">
                <h5>Connector ID</h5>
              </EuiTitle>
            </EuiDescriptionListTitle>
            <EuiDescriptionListDescription>
              {id ? (
                <CopyableText text={id} iconLeft={false} tooltipText="Copy connector ID" />
              ) : (
                '-'
              )}
            </EuiDescriptionListDescription>
          </EuiFlexItem>
        </EuiFlexGroup>
        <EuiSpacer size="m" />
        <EuiDescriptionListTitle>
          <EuiTitle size="xxs">
            <h5>Connector description</h5>
          </EuiTitle>
        </EuiDescriptionListTitle>
        <EuiDescriptionListDescription>{description}</EuiDescriptionListDescription>
      </EuiDescriptionList>
    </>
  );
};
