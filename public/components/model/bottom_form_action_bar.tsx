/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  EuiBottomBar,
  EuiButton,
  EuiButtonEmpty,
  EuiFlexGroup,
  EuiFlexItem,
  EuiText,
} from '@elastic/eui';
import useObservable from 'react-use/lib/useObservable';
import { from } from 'rxjs';

import { useOpenSearchDashboards } from '../../../../../src/plugins/opensearch_dashboards_react/public';

interface BottomFormActionBarProps {
  formId: string;
  errorCount?: number;
  unSavedChangeCount?: number;
  onDiscardButtonClick: () => void;
  isSaveButtonLoading?: boolean;
  isSaveButtonDisabled?: boolean;
}

export const BottomFormActionBar = ({
  formId,
  errorCount = 0,
  unSavedChangeCount = 0,
  onDiscardButtonClick,
  isSaveButtonDisabled,
  isSaveButtonLoading,
}: BottomFormActionBarProps) => {
  const {
    services: { chrome },
  } = useOpenSearchDashboards();
  const isLocked = useObservable(chrome?.getIsNavDrawerLocked$() ?? from([false]));

  return (
    <EuiBottomBar left={isLocked ? '320px' : 0}>
      <EuiFlexGroup alignItems="center" gutterSize="none" justifyContent="spaceBetween">
        <EuiFlexGroup alignItems="center" gutterSize="m">
          {errorCount > 0 && (
            <EuiFlexItem grow={false}>
              <EuiText style={{ padding: '0 8px', borderLeft: '4px solid #BD271E' }}>
                {errorCount} error(s)
              </EuiText>
            </EuiFlexItem>
          )}
          {unSavedChangeCount > 0 && (
            <EuiFlexItem grow={false}>
              <EuiText style={{ padding: '0 8px', borderLeft: '4px solid #F5A700' }}>
                {unSavedChangeCount} unsaved change(s)
              </EuiText>
            </EuiFlexItem>
          )}
        </EuiFlexGroup>
        <EuiFlexGroup alignItems="center" gutterSize="s" justifyContent="flexEnd">
          <EuiFlexItem grow={false}>
            <EuiButtonEmpty color="ghost" iconType="cross" onClick={onDiscardButtonClick}>
              Discard change(s)
            </EuiButtonEmpty>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiButton
              form={formId}
              iconType="check"
              size="s"
              color="primary"
              type="submit"
              fill
              minWidth={87}
              isLoading={isSaveButtonLoading}
              isDisabled={isSaveButtonDisabled}
            >
              Save
            </EuiButton>
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiFlexGroup>
    </EuiBottomBar>
  );
};
