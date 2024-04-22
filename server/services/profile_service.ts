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

import { OpenSearchClient } from '../../../../src/core/server';
import { OpenSearchMLCommonsProfile } from '../../common/profile';

import { PROFILE_BASE_API } from './utils/constants';

export class ProfileService {
  static convertModel(model: OpenSearchMLCommonsProfile['models']['key'], id: string) {
    return {
      id,
      target_worker_nodes: model.target_worker_nodes,
      worker_nodes: model.worker_nodes,
      not_worker_nodes:
        model.target_worker_nodes.filter((nodeId) => !model.worker_nodes?.includes(nodeId)) ?? [],
    };
  }

  public static async getModel(params: {
    transport: OpenSearchClient['transport'];
    modelId: string;
  }) {
    const { transport, modelId } = params;
    const result = (
      await transport.request({
        method: 'GET',
        path: `${PROFILE_BASE_API}/models/${modelId}?view=model`,
      })
    ).body as OpenSearchMLCommonsProfile;
    if (!result.models) {
      return {};
    }
    const model = result.models[modelId];
    return this.convertModel(model, modelId);
  }
}
