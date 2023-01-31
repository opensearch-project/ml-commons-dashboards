/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { CoreSetup } from '../../../../src/core/server';

import modelPlugin from './model_plugin';
import { CLUSTER } from '../services/utils/constants';

export const createModelCluster = (core: CoreSetup) => {
  return core.opensearch.legacy.createClient(CLUSTER.MODEL, {
    plugins: [modelPlugin],
  });
};
