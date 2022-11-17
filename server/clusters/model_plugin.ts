/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { API_ROUTE_PREFIX, MODEL_BASE_API } from '../services/utils/constants';

// eslint-disable-next-line import/no-default-export
export default function (Client: any, config: any, components: any) {
  const ca = components.clientAction.factory;

  if (!Client.prototype.mlCommonsModel) {
    Client.prototype.mlCommonsModel = components.clientAction.namespaceFactory();
  }

  const mlCommonsModel = Client.prototype.mlCommonsModel.prototype;

  mlCommonsModel.search = ca({
    method: 'POST',
    url: {
      fmt: `${MODEL_BASE_API}/_search`,
    },
    needBody: true,
  });

  mlCommonsModel.getOne = ca({
    method: 'GET',
    url: {
      fmt: `${MODEL_BASE_API}/<%=modelId%>`,
      req: {
        modelId: {
          type: 'string',
          required: true,
        },
      },
    },
  });

  mlCommonsModel.delete = ca({
    method: 'DELETE',
    url: {
      fmt: `${MODEL_BASE_API}/<%=modelId%>`,
      req: {
        modelId: {
          type: 'string',
          required: true,
        },
      },
    },
  });

  mlCommonsModel.predict = ca({
    method: 'POST',
    url: {
      fmt: `${API_ROUTE_PREFIX}/_predict/<%=methodName%>/<%=modelId%>`,
      req: {
        methodName: {
          type: 'string',
          required: true,
        },
        modelId: {
          type: 'string',
          required: true,
        },
      },
      needBody: true,
    },
  });

  mlCommonsModel.load = ca({
    method: 'POST',
    url: {
      fmt: `${MODEL_BASE_API}/<%=modelId%>/_load`,
      req: {
        modelId: {
          type: 'string',
          required: true,
        },
      },
    },
  });

  mlCommonsModel.unload = ca({
    method: 'POST',
    url: {
      fmt: `${MODEL_BASE_API}/<%=modelId%>/_unload`,
      req: {
        modelId: {
          type: 'string',
          required: true,
        },
      },
    },
  });
}
