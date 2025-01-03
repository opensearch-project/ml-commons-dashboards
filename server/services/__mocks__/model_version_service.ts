/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

export class ModelVersionService {
  public static async search() {
    return {
      data: [{ name: 'Model 1' }],
      total_models: 1,
    };
  }
}
