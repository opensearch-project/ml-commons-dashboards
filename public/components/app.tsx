/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { I18nProvider } from '@osd/i18n/react';
import { Redirect, Route, Switch } from 'react-router-dom';
import { EuiPage, EuiPageBody } from '@elastic/eui';
import { useObservable } from 'react-use';
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
  application: CoreStart['application'];
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
  navigation,
  uiSettingsClient,
  application,
}: MlCommonsPluginAppDeps) => {
  const dataSourceEnabled = !!dataSource;
  const useNewPageHeader = useObservable(uiSettingsClient.get$('home:useNewHomePage'));
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
                      <Component
                        http={http}
                        notifications={notifications}
                        chrome={chrome}
                        data={data}
                        navigation={navigation}
                        useNewPageHeader={useNewPageHeader}
                        application={application}
                      />
                    )}
                    exact={exact ?? false}
                  />
                ))}
                <Redirect from={routerPaths.root} to={routerPaths.overview} />
              </Switch>
            </EuiPageBody>
          </EuiPage>
          {/* Breadcrumbs will contains dynamic content in new page header, should be provided by each page self*/}
          {!useNewPageHeader && (
            <GlobalBreadcrumbs onBreadcrumbsChange={chrome.setBreadcrumbs} basename={basename} />
          )}
          {dataSourceEnabled && (
            <DataSourceTopNavMenu
              notifications={notifications}
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
