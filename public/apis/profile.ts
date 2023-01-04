/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { DEPLOYED_MODEL_PROFILE_API_ENDPOINT } from '../../server/routes/constants';
import { InnerHttpProvider } from './inner_http_provider';

export interface ModelDeploymentProfile {
  id: string;
  name: string;
  target_node_ids: string[];
  deployed_node_ids: string[];
  not_deployed_node_ids: string[];
}

export class Profile {
  public getAllDeployedModels() {
    return InnerHttpProvider.getHttp().get<ModelDeploymentProfile[]>(
      DEPLOYED_MODEL_PROFILE_API_ENDPOINT
    );
  }
}
