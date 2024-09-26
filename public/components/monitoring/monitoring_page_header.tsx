/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useEffect, useMemo } from 'react';
import { EuiPageHeader, EuiSpacer } from '@elastic/eui';
import { i18n } from '@osd/i18n';

import type { ChromeBreadcrumb } from 'opensearch-dashboards/public';

import { RefreshInterval } from '../common/refresh_interval';
import { NavigationPublicPluginStart } from '../../../../../src/plugins/navigation/public';
import { ApplicationStart } from '../../../../../src/core/public';

export interface MonitoringPageHeaderProps {
  navigation: NavigationPublicPluginStart;
  application: ApplicationStart;
  onRefresh: () => void;
  recordsCount?: number;
  setBreadcrumbs: (breadcrumbs: ChromeBreadcrumb[]) => void;
  useNewPageHeader: boolean;
}

export const MonitoringPageHeader = ({
  onRefresh,
  navigation,
  recordsCount,
  setBreadcrumbs,
  application,
  useNewPageHeader,
}: MonitoringPageHeaderProps) => {
  const { HeaderControl } = navigation.ui;
  const { setAppRightControls } = application;
  const controls = useMemo(() => {
    if (useNewPageHeader) {
      return [
        {
          renderComponent: (
            <div style={{ width: 227 }}>
              <RefreshInterval onRefresh={onRefresh} />
            </div>
          ),
        },
      ];
    }
    return [];
  }, [useNewPageHeader, onRefresh]);

  useEffect(() => {
    if (useNewPageHeader) {
      setBreadcrumbs([
        {
          text: i18n.translate('machineLearning.AIModels.page.title', {
            defaultMessage:
              'AI models {recordsCount, select, undefined {} other {({recordsCount})}}',
            values: {
              recordsCount,
            },
          }),
        },
      ]);
    }
  }, [useNewPageHeader, recordsCount, setBreadcrumbs]);

  if (useNewPageHeader) {
    return <HeaderControl setMountPoint={setAppRightControls} controls={controls} />;
  }
  return (
    <>
      <EuiSpacer size="s" />
      <EuiSpacer size="xs" />
      <EuiPageHeader
        pageTitle="Overview"
        rightSideItems={[<RefreshInterval onRefresh={onRefresh} />]}
      />
      <EuiSpacer size="m" />
    </>
  );
};
