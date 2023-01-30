/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

export class Security {
  public getAccount() {
    return Promise.resolve({ user_name: 'admin' });
  }
}
