/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

import { useOpenSearchDashboards } from '../../../../../src/plugins/opensearch_dashboards_react/public';
import { DATE_FORMAT } from '../../../common';
import { renderTime } from '../../utils';

export const UiSettingDateFormatTime = ({ time }: { time: number | undefined }) => {
  const {
    services: { uiSettings },
  } = useOpenSearchDashboards();
  const dateFormat = uiSettings?.get('dateFormat');

  return <>{time ? renderTime(time, dateFormat || DATE_FORMAT) : '-'}</>;
};
