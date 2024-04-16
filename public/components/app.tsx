/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { I18nProvider } from '@osd/i18n/react';
import { Redirect, Route, Switch } from 'react-router-dom';
import { EuiPage, EuiPageBody } from '@elastic/eui';
import { ROUTES } from '../../common/router';
import { routerPaths } from '../../common/router_paths';

import {
  CoreStart,
  IUiSettingsClient,
  MountPoint,
  SavedObjectsStart,
} from '../../../../src/core/public';
import { NavigationPublicPluginStart } from '../../../../src/plugins/navigation/public';
import { DataPublicPluginStart } from '../../../../src/plugins/data/public';
import type { DataSourceManagementPluginSetup } from '../../../../src/plugins/data_source_management/public';
import type { DataSourcePluginSetup } from '../../../../src/plugins/data_source/public';
import { DataSourceContextProvider } from '../contexts/data_source_context';

import { GlobalBreadcrumbs } from './global_breadcrumbs';
import { DataSourceTopNavMenu } from './data_source_top_nav_menu';

interface MlCommonsPluginAppDeps {
  basename: string;
  notifications: CoreStart['notifications'];
  http: CoreStart['http'];
  navigation: NavigationPublicPluginStart;
  chrome: CoreStart['chrome'];
  data: DataPublicPluginStart;
  uiSettingsClient: IUiSettingsClient;
  savedObjects: SavedObjectsStart;
  dataSource?: DataSourcePluginSetup;
  dataSourceManagement?: DataSourceManagementPluginSetup;
  setActionMenu: (menuMount: MountPoint | undefined) => void;
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
  dataSource,
  dataSourceManagement,
  savedObjects,
  setActionMenu,
}: MlCommonsPluginAppDeps) => {
  const dataSourceEnabled = !!dataSource?.dataSourceEnabled;
  return (
    <I18nProvider>
      <DataSourceContextProvider
        initialValue={{
          dataSourceEnabled,
        }}
      >
        <>
          <EuiPage>
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
                <Redirect from={routerPaths.root} to={routerPaths.overview} />
              </Switch>
            </EuiPageBody>
          </EuiPage>
          <GlobalBreadcrumbs chrome={chrome} basename={basename} />
          {dataSourceEnabled && (
            <DataSourceTopNavMenu
              notifications={notifications}
              dataSource={dataSource}
              dataSourceManagement={dataSourceManagement}
              setActionMenu={setActionMenu}
              savedObjects={savedObjects}
            />
          )}
        </>
      </DataSourceContextProvider>
    </I18nProvider>
  );
};
