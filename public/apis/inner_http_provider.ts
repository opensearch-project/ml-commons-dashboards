/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { CoreStart } from '../../../../src/core/public';

let httpClient: CoreStart['http'] | undefined;

export class InnerHttpProvider {
  public static setHttp(http: CoreStart['http'] | undefined) {
    httpClient = http;
  }

  public static getHttp() {
    if (!httpClient) {
      throw Error('Http Client not set');
    }
    return httpClient;
  }
}
