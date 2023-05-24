/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { APIProvider } from '../../apis/api_provider';
import { MAX_CHUNK_SIZE } from '../common/forms/form_constants';
import { getModelContentHashValue } from './get_model_content_hash_value';
import { ModelFileFormData, ModelUrlFormData } from './register_model.types';

const getModelUploadBase = ({
  name,
  versionNotes,
  modelFileFormat,
  configuration,
}: ModelFileFormData | ModelUrlFormData) => ({
  name,
  description: versionNotes,
  modelFormat: modelFileFormat,
  modelConfig: JSON.parse(configuration),
});

const createModelIfNeedAndUploadVersion = async <T>({
  name,
  modelId,
  description,
  uploader,
}: {
  name: string;
  modelId?: string;
  description?: string;
  uploader: (modelId: string) => Promise<T>;
}) => {
  if (modelId) {
    return await uploader(modelId);
  }
  modelId = (
    await APIProvider.getAPI('modelGroup').register({
      name,
      description,
    })
  ).model_group_id;

  try {
    return await uploader(modelId);
  } catch (error) {
    APIProvider.getAPI('modelGroup').delete(modelId);
    throw error;
  }
};

export async function submitModelWithFile(model: ModelFileFormData) {
  const { modelFile } = model;
  const totalChunks = Math.ceil(modelFile.size / MAX_CHUNK_SIZE);
  const modelContentHashValue = await getModelContentHashValue(modelFile);

  return (
    await createModelIfNeedAndUploadVersion({
      ...model,
      uploader: (modelId: string) =>
        APIProvider.getAPI('model').upload({
          ...getModelUploadBase(model),
          modelGroupId: modelId,
          totalChunks,
          modelContentHashValue,
        }),
    })
  ).model_id;
}

export async function submitModelWithURL(model: ModelUrlFormData) {
  return (
    await createModelIfNeedAndUploadVersion({
      ...model,
      uploader: (modelId: string) =>
        APIProvider.getAPI('model').upload({
          ...getModelUploadBase(model),
          modelGroupId: modelId,
          url: model.modelURL,
        }),
    })
  ).task_id;
}
