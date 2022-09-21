/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { CoreSetup } from '../../../../src/core/server';

import taskPlugin from './task_plugin';
import { CLUSTER } from '../services/utils/constants';

export const createTaskCluster = (core: CoreSetup) => {
  return core.opensearch.legacy.createClient(CLUSTER.TASK, {
    plugins: [taskPlugin],
  });
};
