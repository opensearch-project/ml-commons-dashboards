/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { CoreSetup } from '../../../../src/core/server';

import trainPlugin from './train_plugin';
import { CLUSTER } from '../services/utils/constants';

export const createTrainCluster = (core: CoreSetup) => {
  return core.opensearch.legacy.createClient(CLUSTER.TRAIN, {
    plugins: [trainPlugin],
  });
};
