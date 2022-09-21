/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { PREDICT_BASE_API } from '../services/utils/constants';

// eslint-disable-next-line import/no-default-export
export default function (Client: any, config: any, components: any) {
  const ca = components.clientAction.factory;

  if (!Client.prototype.mlCommonsPredict) {
    Client.prototype.mlCommonsPredict = components.clientAction.namespaceFactory();
  }

  const mlCommonsPredict = Client.prototype.mlCommonsPredict.prototype;

  mlCommonsPredict.predict = ca({
    method: 'POST',
    needBody: true,
    url: {
      fmt: `${PREDICT_BASE_API}/<%=algo%>/<%=modelId%>`,
      req: {
        modelId: {
          type: 'string',
          required: true,
        },
        algo: {
          type: 'string',
          required: true,
        },
      },
    },
  });
}
