/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

export class ProfileService {
  public static async getModel() {
    return {
      id: 'model-1',
      target_worker_nodes: ['node-1'],
      worker_nodes: ['node-1'],
      not_worker_nodes: [],
    };
  }
}
