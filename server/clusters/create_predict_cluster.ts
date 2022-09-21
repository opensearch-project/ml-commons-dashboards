/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { CoreSetup } from '../../../../src/core/server';

import predictPlugin from './predict_plugin';
import { CLUSTER } from '../services/utils/constants';

export const createPredictCluster = (core: CoreSetup) => {
  return core.opensearch.legacy.createClient(CLUSTER.PREDICT, {
    plugins: [predictPlugin],
  });
};
