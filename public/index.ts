/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { PluginInitializerContext } from 'opensearch-dashboards/public';
import { ConfigSchema } from '../common/config';
import './index.scss';

import { MlCommonsPluginPlugin } from './plugin';

// This exports static code and TypeScript types,
// as well as, OpenSearch Dashboards Platform `plugin()` initializer.
export function plugin(initializerContext: PluginInitializerContext<ConfigSchema>) {
  return new MlCommonsPluginPlugin(initializerContext);
}
export { MlCommonsPluginPluginSetup, MlCommonsPluginPluginStart } from './types';
