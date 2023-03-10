/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { ModelRepository } from '../../apis/model_repository';
import { ModelRepositoryManager } from '../model_repository_manager';

jest.mock('../../apis/model_repository');

describe('ModelRepositoryManager', () => {
  beforeEach(() => {
    jest.spyOn(ModelRepository.prototype, 'getPreTrainedModelConfig');
    jest.spyOn(ModelRepository.prototype, 'getPreTrainedModels');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return consistent pre-trained models', async () => {
    const models = await new ModelRepositoryManager().getPreTrainedModels$().toPromise();
    expect(models).toEqual(
      expect.objectContaining({
        'sentence-transformers/all-distilroberta-v1': expect.anything(),
      })
    );
  });

  it('should call getPreTrainedModels once after call getPreTrainedModels$ multi times', async () => {
    const manager = new ModelRepositoryManager();
    expect(ModelRepository.prototype.getPreTrainedModels).not.toHaveBeenCalled();
    await manager.getPreTrainedModels$().toPromise();
    expect(ModelRepository.prototype.getPreTrainedModels).toHaveBeenCalledTimes(1);
    await manager.getPreTrainedModels$().toPromise();
    expect(ModelRepository.prototype.getPreTrainedModels).toHaveBeenCalledTimes(1);
  });

  it('should call getPreTrainedModels twice after getPreTrainedModels throw error first time and call getPreTrainedModels$ multi times', async () => {
    const manager = new ModelRepositoryManager();
    const mockError = new Error();
    jest.spyOn(ModelRepository.prototype, 'getPreTrainedModels').mockRejectedValueOnce(mockError);
    await expect(manager.getPreTrainedModels$().toPromise()).rejects.toThrowError(mockError);
    expect(ModelRepository.prototype.getPreTrainedModels).toHaveBeenCalledTimes(1);
    await manager.getPreTrainedModels$().toPromise();
    expect(ModelRepository.prototype.getPreTrainedModels).toHaveBeenCalledTimes(2);
  });

  it('should call getPreTrainedModelConfig with consistent config URL and return consistent config', async () => {
    const manager = new ModelRepositoryManager();
    const result = await manager
      .getPreTrainedModel$('sentence-transformers/all-distilroberta-v1', 'torch_script')
      .toPromise();
    expect(ModelRepository.prototype.getPreTrainedModelConfig).toHaveBeenCalledWith(
      'https://artifacts.opensearch.org/models/ml-models/huggingface/sentence-transformers/all-distilroberta-v1/1.0.1/torch_script/config.json'
    );
    expect(result).toEqual(
      expect.objectContaining({
        url:
          'https://artifacts.opensearch.org/models/ml-models/huggingface/sentence-transformers/all-distilroberta-v1/1.0.1/torch_script/sentence-transformers_all-distilroberta-v1-1.0.1-torch_script.zip',
        config: expect.objectContaining({
          model_content_hash_value:
            '92bc10216c720b57a6bab1d7ca2cc2e559156997212a7f0d8bb70f2edfedc78b',
        }),
      })
    );
  });

  it('should call getPreTrainedModelConfig once after call getPreTrainedModel$ multi times', async () => {
    const manager = new ModelRepositoryManager();
    expect(ModelRepository.prototype.getPreTrainedModelConfig).not.toHaveBeenCalled();
    await manager
      .getPreTrainedModel$('sentence-transformers/all-distilroberta-v1', 'torch_script')
      .toPromise();
    expect(ModelRepository.prototype.getPreTrainedModelConfig).toHaveBeenCalledTimes(1);
    await manager
      .getPreTrainedModel$('sentence-transformers/all-distilroberta-v1', 'torch_script')
      .toPromise();
    expect(ModelRepository.prototype.getPreTrainedModelConfig).toHaveBeenCalledTimes(1);
  });

  it('should call getPreTrainedModelConfig twice after after getPreTrainedModelConfig throw error first time and call getPreTrainedModel$ multi times', async () => {
    const manager = new ModelRepositoryManager();
    const mockError = new Error();
    jest
      .spyOn(ModelRepository.prototype, 'getPreTrainedModelConfig')
      .mockRejectedValueOnce(mockError);
    await expect(
      manager
        .getPreTrainedModel$('sentence-transformers/all-distilroberta-v1', 'torch_script')
        .toPromise()
    ).rejects.toThrowError(mockError);
    expect(ModelRepository.prototype.getPreTrainedModelConfig).toHaveBeenCalledTimes(1);
    await manager
      .getPreTrainedModel$('sentence-transformers/all-distilroberta-v1', 'torch_script')
      .toPromise();
    expect(ModelRepository.prototype.getPreTrainedModelConfig).toHaveBeenCalledTimes(2);
  });
});
