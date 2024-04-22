/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

export class ConnectorService {
  public static async search() {
    return {
      data: ['connector 1', 'connector 2'],
      total_connectors: 2,
    };
  }

  public static async getUniqueInternalConnectorNames() {
    return ['internal connector 1', 'internal connector 2'];
  }
}
