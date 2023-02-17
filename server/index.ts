/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { schema } from '@osd/config-schema';

import { PluginConfigDescriptor, PluginInitializerContext } from '../../../src/core/server';
import { MlCommonsPlugin } from './plugin';

// This exports static code and TypeScript types,
// as well as, OpenSearch Dashboards Platform `plugin()` initializer.

export function plugin(initializerContext: PluginInitializerContext) {
  return new MlCommonsPlugin(initializerContext);
}

export { MlCommonsPluginSetup, MlCommonsPluginStart } from './types';

export const config: PluginConfigDescriptor = {
  schema: schema.object({
    enabled: schema.boolean({ defaultValue: false }),
  }),
};
