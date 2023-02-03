/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

/*
 *   Copyright OpenSearch Contributors
 *
 *   Licensed under the Apache License, Version 2.0 (the "License").
 *   You may not use this file except in compliance with the License.
 *   A copy of the License is located at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 *   or in the "license" file accompanying this file. This file is distributed
 *   on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 *   express or implied. See the License for the specific language governing
 *   permissions and limitations under the License.
 */

import { IScopedClusterClient } from '../../../../src/core/server';
import { TASK_BASE_API } from './utils/constants';

export class TaskService {
  public static async getOne({ client, taskId }: { client: IScopedClusterClient; taskId: string }) {
    return (
      await client.asCurrentUser.transport.request({
        method: 'GET',
        path: `${TASK_BASE_API}/${taskId}`,
      })
    ).body;
  }
}
