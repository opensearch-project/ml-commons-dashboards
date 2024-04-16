/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { AppMountParameters, CoreSetup, CoreStart, Plugin } from '../../../src/core/public';
import {
  MlCommonsPluginPluginSetup,
  MlCommonsPluginPluginStart,
  AppPluginStartDependencies,
  MLServices,
  MlCommonsPluginPluginSetupDependencies,
} from './types';
import { PLUGIN_NAME, PLUGIN_ID } from '../common';

export class MlCommonsPluginPlugin
  implements Plugin<MlCommonsPluginPluginSetup, MlCommonsPluginPluginStart> {
  public setup(
    core: CoreSetup<AppPluginStartDependencies, AppPluginStartDependencies>,
    { dataSource, dataSourceManagement }: MlCommonsPluginPluginSetupDependencies
  ): MlCommonsPluginPluginSetup {
    // Register an application into the side navigation menu
    core.application.register({
      id: PLUGIN_ID,
      title: PLUGIN_NAME,
      category: {
        id: 'opensearch',
        label: 'OpenSearch Plugins',
      },
      async mount(params: AppMountParameters) {
        // Load application bundle
        const { renderApp } = await import('./application');
        // Get start services as specified in opensearch_dashboards.json
        const [coreStart, pluginsStart] = await core.getStartServices();
        const { data, navigation } = pluginsStart;

        const services: MLServices = {
          ...coreStart,
          data,
          navigation,
          history: params.history,
          dataSource,
          dataSourceManagement,
          setHeaderActionMenu: params.setHeaderActionMenu,
        };
        // Render the application
        return renderApp(params, services);
      },
    });

    // Return methods that should be available to other plugins
    return {};
  }

  public start(core: CoreStart): MlCommonsPluginPluginStart {
    return {};
  }

  public stop() {}
}
