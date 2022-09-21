/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { TASK_BASE_API } from '../services/utils/constants';

// eslint-disable-next-line import/no-default-export
export default function (Client: any, config: any, components: any) {
  const ca = components.clientAction.factory;

  if (!Client.prototype.mlCommonsTask) {
    Client.prototype.mlCommonsTask = components.clientAction.namespaceFactory();
  }

  const mlCommonsTask = Client.prototype.mlCommonsTask.prototype;

  mlCommonsTask.search = ca({
    method: 'POST',
    url: {
      fmt: `${TASK_BASE_API}/_search`,
    },
    needBody: true,
  });

  mlCommonsTask.getById = ca({
    method: 'GET',
    url: {
      fmt: `${TASK_BASE_API}/<%=taskId%>`,
      req: {
        taskId: {
          type: 'string',
          required: true,
        },
      },
    },
  });

  mlCommonsTask.delete = ca({
    method: 'DELETE',
    url: {
      fmt: `${TASK_BASE_API}/<%=taskId%>`,
      req: {
        taskId: {
          type: 'string',
          required: true,
        },
      },
    },
  });
}
