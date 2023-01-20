/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

export class Profile {
  public getModel(id: string) {
    return Promise.resolve({
      id,
      target_worker_nodes: ['node-1', 'node-2', 'node-3'],
      worker_nodes: ['node-1', 'node-2'],
      not_worker_nodes: ['node-3'],
    });
  }
}
