/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

import * as PluginContext from '../../../../../../src/plugins/opensearch_dashboards_react/public';
import { render, screen } from '../../../../test/test_utils';
import { UiSettingDateFormatTime } from '../ui_setting_date_format_time';

// Cannot spyOn(PluginContext, 'useOpenSearchDashboards') directly as it results in error:
// TypeError: Cannot redefine property: useOpenSearchDashboards
// So we have to mock the entire module first as a workaround
jest.mock('../../../../../../src/plugins/opensearch_dashboards_react/public', () => {
  return {
    __esModule: true,
    ...jest.requireActual('../../../../../../src/plugins/opensearch_dashboards_react/public'),
  };
});

describe('<UiSettingDateFormatTime />', () => {
  it('should render "-" if time was undefined', () => {
    render(<UiSettingDateFormatTime time={undefined} />);
    expect(screen.getByText('-')).toBeInTheDocument();
  });

  it('should render consistent time text based ui setting', () => {
    const opensearchDashboardsMock = jest
      .spyOn(PluginContext, 'useOpenSearchDashboards')
      .mockReturnValue({
        services: {
          uiSettings: {
            get: () => 'MMM D, yyyy @ HH:mm:ss',
          },
        },
      });

    render(<UiSettingDateFormatTime time={1682676759143} />);
    expect(screen.getByText('Apr 28, 2023 @ 10:12:39')).toBeInTheDocument();

    opensearchDashboardsMock.mockRestore();
  });

  it('should render consistent time text based default time format', () => {
    render(<UiSettingDateFormatTime time={1682676759143} />);
    expect(screen.getByText('Apr 28, 2023 @ 10:12:39.143')).toBeInTheDocument();
  });
});
