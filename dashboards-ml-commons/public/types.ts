/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { DataPublicPluginStart } from '../../../../src/plugins/data/public';
import { NavigationPublicPluginStart } from '../../../../src/plugins/navigation/public';
import { AppMountParameters, CoreStart } from '../../../../src/core/public';
import { History } from 'history';

export interface MlCommonsPluginPluginSetup {
  getGreeting: () => string;
}
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface MlCommonsPluginPluginStart { }

export interface AppPluginStartDependencies {
  navigation: NavigationPublicPluginStart;
  data: DataPublicPluginStart;
}


export interface MLServices extends CoreStart {
  setHeaderActionMenu: AppMountParameters['setHeaderActionMenu'];
  navigation: NavigationPublicPluginStart;
  data: DataPublicPluginStart;
  history: History;
}


type Column_meta = {
  name: string,
  column_type: string
}

export type Row = {
  column_type: string
  value: number | string | boolean
}

export type Rows = { values: Array<Row> }

export type Input_data = {
  column_metas: Array<Column_meta>
  rows: Array<Rows>
}