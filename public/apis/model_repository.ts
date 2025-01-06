/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  MODEL_REPOSITORY_API_ENDPOINT,
  MODEL_REPOSITORY_CONFIG_URL_API_ENDPOINT,
} from '../../server/routes/constants';
import { InnerHttpProvider } from './inner_http_provider';

interface PreTrainedModelInfo {
  model_url: string;
  config_url: string;
}

interface PreTrainedModel {
  version: string;
  description: string;
  torch_script: PreTrainedModelInfo;
  onnx: PreTrainedModelInfo;
}

interface PreTrainedModels {
  [key: string]: PreTrainedModel;
}

export class ModelRepository {
  public getPreTrainedModels() {
    return InnerHttpProvider.getHttp().get<PreTrainedModels>(MODEL_REPOSITORY_API_ENDPOINT);
  }

  public getPreTrainedModelConfig(configURL: string) {
    return InnerHttpProvider.getHttp().get<any>(
      `${MODEL_REPOSITORY_CONFIG_URL_API_ENDPOINT}/${encodeURIComponent(configURL)}`
    );
  }
}
