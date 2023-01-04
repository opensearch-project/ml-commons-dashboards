/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import {
  EuiPanel,
  EuiPageHeader,
  EuiTitle,
  EuiSpacer,
  EuiFlexGroup,
  EuiFlexItem,
  EuiText,
} from '@elastic/eui';
import React from 'react';
import { SearchBar } from '../searchbar';
import { FilterButton } from '../filter_button';
export const Monitoring = () => {
  return (
    <div>
      <EuiPageHeader pageTitle="Monitoring" />
      <EuiSpacer size="m" />
      <EuiPanel>
        <EuiTitle size="s">
          <h3>Deployed models</h3>
        </EuiTitle>
        <EuiSpacer />
        <EuiFlexGroup gutterSize="l">
          <EuiFlexItem>
            <SearchBar />
          </EuiFlexItem>
          {/* <EuiFlexItem grow={false}>
            <FilterButton />
          </EuiFlexItem> */}
        </EuiFlexGroup>
      </EuiPanel>
    </div>
  );
};
