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

import { createModelCluster } from './clusters/create_model_cluster';
import { MlCommonsPluginSetup, MlCommonsPluginStart } from './types';
import { modelRouter, modelAggregateRouter, profileRouter } from './routes';
import { ModelService } from './services';

export class MlCommonsPlugin implements Plugin<MlCommonsPluginSetup, MlCommonsPluginStart> {
  private readonly logger: Logger;

  constructor(initializerContext: PluginInitializerContext) {
    this.logger = initializerContext.logger.get();
  }

  public setup(core: CoreSetup) {
    this.logger.debug('mlCommons: Setup');
    const router = core.http.createRouter();

    const modelOSClient = createModelCluster(core);

    const modelService = new ModelService(modelOSClient);

    const services = {
      modelService,
    };

    modelRouter(services, router);
    modelAggregateRouter(router);
    profileRouter(router);

    return {};
  }

  public start(core: CoreStart) {
    this.logger.debug('mlCommons: Started');

    return {};
  }

  public stop() {}
}
