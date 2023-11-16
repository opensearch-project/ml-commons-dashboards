/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

export class Connector {
  public async getAll() {
    return {
      data: [
        {
          id: 'external-connector-1-id',
          name: 'External Connector 1',
        },
      ],
      total_connectors: 1,
    };
  }

  public async getAllInternal() {
    return {
      data: ['Internal Connector 1', 'Common Connector'],
    };
  }
}
