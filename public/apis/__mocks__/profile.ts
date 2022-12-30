/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

export class Profile {
  public getAllDeployedModels() {
    return Promise.resolve([
      {
        id: 'model-1-id',
        name: 'model-1-name',
        target_node_ids: ['node-1', 'node-2', 'node-3'],
        deployed_node_ids: ['node-1', 'node-2'],
        not_deployed_node_ids: ['node-3'],
      },
    ]);
  }
}
