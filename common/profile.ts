/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { MODEL_STATE } from './model';

export interface OpenSearchMLCommonsProfile {
  nodes: {
    [key: string]: {
      models: {
        [key: string]: {
          worker_nodes: string[];
          predictor: string;
          model_state: MODEL_STATE;
          predict_request_stats: {
            count: number;
            max: number;
            min: number;
            average: number;
            p50: number;
            p90: number;
            p99: number;
          };
        };
      };
    };
  };
  models: {
    [key: string]: {
      target_worker_nodes: string[];
      worker_nodes: string[];
    };
  };
}
