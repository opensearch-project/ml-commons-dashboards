/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { DEPLOYED_MODEL_PROFILE_API_ENDPOINT } from '../../server/routes/constants';
import { InnerHttpProvider } from './inner_http_provider';

export interface ModelDeploymentProfile {
  id?: string;
  target_worker_nodes?: string[];
  worker_nodes?: string[];
  not_worker_nodes?: string[];
}

export class Profile {
  public getModel(modelId: string, { dataSourceId }: { dataSourceId?: string }) {
    return InnerHttpProvider.getHttp().get<ModelDeploymentProfile>(
      `${DEPLOYED_MODEL_PROFILE_API_ENDPOINT}/${modelId}`,
      {
        query: {
          data_source_id: dataSourceId,
        },
      }
    );
  }
}
