/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { ModelDeployStatus } from './types';

const MODEL_STATUS_MAPPING: Record<string, ModelDeployStatus> = {
  LOADED: 'responding',
  PARTIAL_LOADED: 'partial-responding',
  LOAD_FAILED: 'not-responding',
};

/**
 * Return mapped model status by filtering the key with {targetKeys}
 * The returned model status will be in the same order as {targetKeys}
 */
export function getMappedModelStatus(
  all: Array<{ key: string }>,
  targetKeys: string[] = ['LOADED', 'PARTIAL_LOADED', 'LOAD_FAILED']
) {
  const results: ModelDeployStatus[] = [];
  for (const t of targetKeys) {
    if (all.find(({ key }) => key === t) && Boolean(MODEL_STATUS_MAPPING[t])) {
      results.push(MODEL_STATUS_MAPPING[t]);
    }
  }
  return results;
}
