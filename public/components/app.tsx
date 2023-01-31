/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { I18nProvider } from '@osd/i18n/react';
import { Provider as ReduxProvider } from 'react-redux';
import { Redirect, Route, Switch } from 'react-router-dom';
import { EuiPage, EuiPageBody, EuiPageSideBar } from '@elastic/eui';
import { ROUTES } from '../../common/router';
import { routerPaths } from '../../common/router_paths';

import { store } from '../../redux/store';

import { CoreStart, IUiSettingsClient } from '../../../../src/core/public';
import { NavigationPublicPluginStart } from '../../../../src/plugins/navigation/public';
import { DataPublicPluginStart } from '../../../../src/plugins/data/public';

import { GlobalBreadcrumbs } from './global_breadcrumbs';
import { NavPanel } from './nav_panel';

interface MlCommonsPluginAppDeps {
  basename: string;
  notifications: CoreStart['notifications'];
  http: CoreStart['http'];
  navigation: NavigationPublicPluginStart;
  chrome: CoreStart['chrome'];
  data: DataPublicPluginStart;
  uiSettingsClient: IUiSettingsClient;
}

export interface ComponentsCommonProps {
  notifications: CoreStart['notifications'];
  http: CoreStart['http'];
  data: DataPublicPluginStart;
}

export const MlCommonsPluginApp = ({
  basename,
  notifications,
  http,
  chrome,
  data,
}: MlCommonsPluginAppDeps) => {
  // Render the application DOM.
  // Note that `navigation.ui.TopNavMenu` is a stateful component exported on the `navigation` plugin's start contract.
  return (
    <ReduxProvider store={store}>
      <I18nProvider>
        <>
          <EuiPage>
            <EuiPageSideBar>
              <NavPanel />
            </EuiPageSideBar>
            <EuiPageBody component="main">
              <Switch>
                {ROUTES.map(({ path, Component, exact }) => (
                  <Route
                    key={path}
                    path={path}
                    render={() => (
                      <Component http={http} notifications={notifications} data={data} />
                    )}
                    exact={exact ?? false}
                  />
                ))}
                <Redirect from={routerPaths.root} to={routerPaths.monitoring} />
              </Switch>
            </EuiPageBody>
          </EuiPage>
          <GlobalBreadcrumbs chrome={chrome} basename={basename} />
        </>
      </I18nProvider>
    </ReduxProvider>
  );
};
