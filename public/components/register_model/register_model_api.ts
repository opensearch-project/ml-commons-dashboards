/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { APIProvider } from '../../apis/api_provider';
import { MAX_CHUNK_SIZE } from '../common/forms/form_constants';
import { getModelContentHashValue } from './get_model_content_hash_value';
import { ModelFileFormData, ModelUrlFormData } from './register_model.types';

const getModelUploadBase = async ({
  name,
  description,
  versionNotes,
  modelFileFormat,
  configuration,
  modelId,
}: ModelFileFormData | ModelUrlFormData) => {
  const modelGroupId =
    modelId ||
    (
      await APIProvider.getAPI('modelGroup').register({
        name,
        description,
      })
    ).model_group_id;
  return {
    name,
    description: versionNotes,
    modelFormat: modelFileFormat,
    modelGroupId,
    modelConfig: JSON.parse(configuration),
  };
};

export async function submitModelWithFile(model: ModelFileFormData) {
  const { modelFile } = model;
  const totalChunks = Math.ceil(modelFile.size / MAX_CHUNK_SIZE);
  const modelContentHashValue = await getModelContentHashValue(modelFile);
  const modelUploadBase = await getModelUploadBase(model);

  let modelId;
  try {
    modelId = (
      await APIProvider.getAPI('model').upload({
        ...modelUploadBase,
        totalChunks,
        modelContentHashValue,
      })
    ).model_id;
  } catch (error) {
    APIProvider.getAPI('modelGroup').delete(modelUploadBase.modelGroupId);
    throw error;
  }
  return modelId;
}

export async function submitModelWithURL(model: ModelUrlFormData) {
  const modelUploadBase = await getModelUploadBase(model);

  let taskId;
  try {
    taskId = (
      await APIProvider.getAPI('model').upload({
        ...modelUploadBase,
        url: model.modelURL,
      })
    ).task_id;
  } catch (error) {
    APIProvider.getAPI('modelGroup').delete(modelUploadBase.modelGroupId);
    throw error;
  }

  return taskId;
}
