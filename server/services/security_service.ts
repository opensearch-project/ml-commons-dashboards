/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { OpenSearchSecurityAccount } from '../../common/security';
import { IScopedClusterClient } from '../../../../src/core/server/opensearch/client';
import { SECURITY_ACCOUNT_API } from './utils/constants';

export class SecurityService {
  public static async getAccount({ client }: { client: IScopedClusterClient }) {
    return (
      await client.asCurrentUser.transport.request({
        method: 'GET',
        path: SECURITY_ACCOUNT_API,
      })
    ).body as OpenSearchSecurityAccount;
  }
}
