/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { TRAIN_BASE_API } from '../services/utils/constants';

// eslint-disable-next-line import/no-default-export
export default function (Client: any, config: any, components: any) {
  const ca = components.clientAction.factory;

  if (!Client.prototype.mlCommonsTrain) {
    Client.prototype.mlCommonsTrain = components.clientAction.namespaceFactory();
  }

  const mlCommonsTrain = Client.prototype.mlCommonsTrain.prototype;

  /**
   * Training can occur both synchronously and asynchronously.
   */
  mlCommonsTrain.trainModel = ca({
    method: 'POST',
    needBody: true,
    url: {
      fmt: `${TRAIN_BASE_API}/<%=algo%>?async=<%=async%>`,
      req: {
        algo: {
          type: 'string',
          required: true,
        },
        async: {
          type: 'boolean',
          required: true,
        },
      },
    },
  });
}
