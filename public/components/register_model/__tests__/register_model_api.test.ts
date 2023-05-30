/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { Model } from '../../../apis/model';
import { ModelVersion } from '../../../apis/model_version';
import { submitModelWithFile, submitModelWithURL } from '../register_model_api';

describe('register model api', () => {
  beforeEach(() => {
    jest.spyOn(Model.prototype, 'register').mockResolvedValue({ model_id: '1', status: 'CREATED' });
    jest.spyOn(Model.prototype, 'delete').mockResolvedValue({ status: 'success' });
    jest
      .spyOn(ModelVersion.prototype, 'upload')
      .mockResolvedValue({ task_id: 'foo', model_version_id: 'bar' });
  });

  afterEach(() => {
    jest.spyOn(Model.prototype, 'register').mockRestore();
    jest.spyOn(Model.prototype, 'delete').mockRestore();
    jest.spyOn(ModelVersion.prototype, 'upload').mockRestore();
  });

  it('should not call register model group API if modelId provided', async () => {
    expect(Model.prototype.register).not.toHaveBeenCalled();

    await submitModelWithFile({
      name: 'foo',
      description: 'bar',
      configuration: '{}',
      modelFileFormat: '',
      modelId: 'a-exists-model-id',
      modelFile: new File([], 'artifact.zip'),
    });

    expect(Model.prototype.register).not.toHaveBeenCalled();
  });

  it('should not call delete model group API if modelId provided and model upload failed', async () => {
    const uploadError = new Error();
    const uploadMock = jest.spyOn(ModelVersion.prototype, 'upload').mockRejectedValue(uploadError);

    try {
      await submitModelWithFile({
        name: 'foo',
        description: 'bar',
        configuration: '{}',
        modelFileFormat: '',
        modelId: 'a-exists-model-id',
        modelFile: new File([], 'artifact.zip'),
      });
    } catch (error) {
      expect(error).toBe(uploadError);
    }
    expect(Model.prototype.delete).not.toHaveBeenCalled();

    uploadMock.mockRestore();
  });

  describe('submitModelWithFile', () => {
    it('should call register model group API with name and description', async () => {
      expect(Model.prototype.register).not.toHaveBeenCalled();

      await submitModelWithFile({
        name: 'foo',
        description: 'bar',
        configuration: '{}',
        modelFileFormat: '',
        modelFile: new File([], 'artifact.zip'),
      });

      expect(Model.prototype.register).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'foo',
          description: 'bar',
        })
      );
    });

    it('should delete created model group API upload failed', async () => {
      const uploadError = new Error();
      const uploadMock = jest
        .spyOn(ModelVersion.prototype, 'upload')
        .mockRejectedValue(uploadError);

      expect(Model.prototype.delete).not.toHaveBeenCalled();
      try {
        await submitModelWithFile({
          name: 'foo',
          description: 'bar',
          configuration: '{}',
          modelFileFormat: '',
          modelFile: new File([], 'artifact.zip'),
        });
      } catch (error) {
        expect(uploadError).toBe(error);
      }
      expect(Model.prototype.delete).toHaveBeenCalledWith('1');

      uploadMock.mockRestore();
    });

    it('should return task id and model id after submit successful', async () => {
      const result = await submitModelWithFile({
        name: 'foo',
        description: 'bar',
        configuration: '{}',
        modelFileFormat: '',
        modelFile: new File([], 'artifact.zip'),
      });

      expect(result).toEqual({
        modelId: '1',
        modelVersionId: 'bar',
      });
    });
  });

  describe('submitModelWithURL', () => {
    it('should call register model group API with name and description', async () => {
      expect(Model.prototype.register).not.toHaveBeenCalled();

      await submitModelWithURL({
        name: 'foo',
        description: 'bar',
        configuration: '{}',
        modelFileFormat: '',
        modelURL: 'https://address.to/artifact.zip',
      });

      expect(Model.prototype.register).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'foo',
          description: 'bar',
        })
      );
    });

    it('should delete created model group API upload failed', async () => {
      const uploadError = new Error();
      const uploadMock = jest
        .spyOn(ModelVersion.prototype, 'upload')
        .mockRejectedValue(uploadError);

      expect(Model.prototype.delete).not.toHaveBeenCalled();
      try {
        await submitModelWithURL({
          name: 'foo',
          description: 'bar',
          configuration: '{}',
          modelFileFormat: '',
          modelURL: 'https://address.to/artifact.zip',
        });
      } catch (error) {
        expect(uploadError).toBe(error);
      }
      expect(Model.prototype.delete).toHaveBeenCalledWith('1');

      uploadMock.mockRestore();
    });

    it('should return model id and model version id after submit successful', async () => {
      const result = await submitModelWithURL({
        name: 'foo',
        description: 'bar',
        configuration: '{}',
        modelFileFormat: '',
        modelURL: 'https://address.to/artifact.zip',
      });

      expect(result).toEqual({
        modelId: '1',
        taskId: 'foo',
      });
    });
  });
});
