/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { InnerHttpProvider } from './inner_http_provider';
import { OpenSearchSecurityAccount } from '../../common/security';
import { SECURITY_ACCOUNT_API_ENDPOINT } from '../../server/routes/constants';

export class Security {
  public getAccount() {
    return InnerHttpProvider.getHttp().get<OpenSearchSecurityAccount>(
      SECURITY_ACCOUNT_API_ENDPOINT
    );
  }
}
