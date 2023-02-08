/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

export class Model {
  public search() {
    return Promise.resolve({
      data: [
        {
          id: 'model-1-id',
          name: 'model-1-name',
          current_worker_node_count: 1,
          planning_worker_node_count: 3,
          planning_worker_nodes: ['node1', 'node2', 'node3'],
        },
      ],
      total_models: 1,
    });
  }

  public upload({ url }: { url?: string }) {
    return Promise.resolve(
      url === undefined ? { model_id: 'model-id-1' } : { task_id: 'task-id-1' }
    );
  }

  public uploadChunk() {
    return Promise.resolve();
  }
}
