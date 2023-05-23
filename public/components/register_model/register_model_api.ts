/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { APIProvider } from '../../apis/api_provider';
import { MAX_CHUNK_SIZE } from '../common/forms/form_constants';
import { getModelContentHashValue } from './get_model_content_hash_value';
import { ModelFileFormData, ModelUrlFormData } from './register_model.types';

export async function submitModelWithFile(model: ModelFileFormData) {
  const modelUploadBase = {
    name: model.name,
    version: model.version,
    description: model.description,
    // TODO: Need to confirm if we have the model format input
    modelFormat: 'TORCH_SCRIPT',
    modelConfig: JSON.parse(model.configuration),
  };
  const { modelFile } = model;
  const totalChunks = Math.ceil(modelFile.size / MAX_CHUNK_SIZE);
  const modelContentHashValue = await getModelContentHashValue(modelFile);

  const modelId = (
    await APIProvider.getAPI('model').upload({
      ...modelUploadBase,
      totalChunks,
      modelContentHashValue,
    })
  ).model_id;

  return modelId;
}

export async function submitModelWithURL(model: ModelUrlFormData) {
  const modelUploadBase = {
    name: model.name,
    version: model.version,
    description: model.description,
    // TODO: Need to confirm if we have the model format input
    modelFormat: 'TORCH_SCRIPT',
    modelConfig: JSON.parse(model.configuration),
  };

  const { task_id: taskId } = await APIProvider.getAPI('model').upload({
    ...modelUploadBase,
    url: model.modelURL,
  });

  return taskId;
}
