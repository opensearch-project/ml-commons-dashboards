/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import userEvent from '@testing-library/user-event';
import { applicationServiceMock } from '../../../../../../src/core/public/mocks';
import { navigationPluginMock } from '../../../../../../src/plugins/navigation/public/mocks';

import { render, screen } from '../../../../test/test_utils';
import { MonitoringPageHeader, MonitoringPageHeaderProps } from '../monitoring_page_header';

jest.mock('../../../apis/connector');

async function setup(options: Partial<MonitoringPageHeaderProps>) {
  const setBreadcrumbsMock = jest.fn();
  const onRefreshMock = jest.fn();
  const applicationStartMock = applicationServiceMock.createStartContract();
  const navigationStartMock = navigationPluginMock.createStartContract();
  const user = userEvent.setup({});

  navigationStartMock.ui.HeaderControl = ({ controls }) => {
    return controls?.[0].renderComponent ?? null;
  };

  const renderResult = render(
    <MonitoringPageHeader
      navigation={navigationStartMock}
      application={applicationStartMock}
      setBreadcrumbs={setBreadcrumbsMock}
      onRefresh={onRefreshMock}
      useNewPageHeader={true}
      {...options}
    />
  );

  return {
    user,
    renderResult,
    setBreadcrumbsMock,
    onRefreshMock,
    applicationStartMock,
    navigationStartMock,
  };
}

describe('<MonitoringPageHeader />', () => {
  it('should old page header and refresh button when usePageHeader is false', async () => {
    await setup({
      useNewPageHeader: false,
    });
    expect(screen.getByText('Overview')).toBeInTheDocument();
    expect(screen.getByLabelText('set refresh interval')).toBeInTheDocument();
  });

  it('should set breadcrumbs and render refresh button', async () => {
    const { setBreadcrumbsMock } = await setup({
      useNewPageHeader: true,
      recordsCount: 2,
    });

    expect(setBreadcrumbsMock).toHaveBeenCalledWith([
      {
        text: 'AI models (2)',
      },
    ]);
    expect(screen.getByLabelText('set refresh interval')).toBeInTheDocument();
  });
});
