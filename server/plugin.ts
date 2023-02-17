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
import { modelRouter, profileRouter } from './routes';
import { ConfigSchema } from '../common/config';

export class MlCommonsPlugin implements Plugin<MlCommonsPluginSetup, MlCommonsPluginStart> {
  private readonly logger: Logger;
  private enabled = false;

  constructor(initializerContext: PluginInitializerContext<ConfigSchema>) {
    this.logger = initializerContext.logger.get();
    initializerContext.config.create().subscribe((config) => {
      this.enabled = config.enabled;
    });
  }

  public setup(core: CoreSetup) {
    this.logger.debug('mlCommons: Setup');

    if (!this.enabled) {
      return {};
    }

    const router = core.http.createRouter();

    modelRouter(router);
    profileRouter(router);

    return {};
  }

  public start(core: CoreStart) {
    this.logger.debug('mlCommons: Started');

    return {};
  }

  public stop() {}
}
