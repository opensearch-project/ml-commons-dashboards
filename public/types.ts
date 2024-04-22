/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { History } from 'history';
import { DataPublicPluginStart } from '../../../src/plugins/data/public';
import { NavigationPublicPluginStart } from '../../../src/plugins/navigation/public';
import { AppMountParameters, CoreStart } from '../../../src/core/public';
import type { DataSourceManagementPluginSetup } from '../../../src/plugins/data_source_management/public';
import type { DataSourcePluginSetup } from '../../../src/plugins/data_source/public';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface MlCommonsPluginPluginSetup {}
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface MlCommonsPluginPluginStart {}

export interface MlCommonsPluginPluginSetupDependencies {
  dataSource?: DataSourcePluginSetup;
  dataSourceManagement?: DataSourceManagementPluginSetup;
}

export interface AppPluginStartDependencies {
  navigation: NavigationPublicPluginStart;
  data: DataPublicPluginStart;
}

export interface MLServices extends CoreStart, MlCommonsPluginPluginSetupDependencies {
  setHeaderActionMenu: AppMountParameters['setHeaderActionMenu'];
  navigation: NavigationPublicPluginStart;
  data: DataPublicPluginStart;
  history: History;
}

interface ColumnMeta {
  name: string;
  column_type: string;
}

export interface Row {
  column_type: string;
  value: number | string | boolean;
}

export interface Rows {
  values: Row[];
}

export interface InputData {
  column_metas: ColumnMeta[];
  rows: Rows[];
}
