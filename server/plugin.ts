/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  PluginInitializerContext,
  CoreSetup,
  CoreStart,
  Plugin,
  Logger,
} from '../../../src/core/server';

import { MlCommonsPluginSetup, MlCommonsPluginStart } from './types';
import { connectorRouter, modelRouter, profileRouter } from './routes';

export class MlCommonsPlugin implements Plugin<MlCommonsPluginSetup, MlCommonsPluginStart> {
  private readonly logger: Logger;

  constructor(initializerContext: PluginInitializerContext) {
    this.logger = initializerContext.logger.get();
  }

  public setup(core: CoreSetup) {
    this.logger.debug('mlCommons: Setup');
    const router = core.http.createRouter();

    modelRouter(router);
    profileRouter(router);
    connectorRouter(router);

    return {};
  }

  public start(core: CoreStart) {
    this.logger.debug('mlCommons: Started');

    return {};
  }

  public stop() {}
}
