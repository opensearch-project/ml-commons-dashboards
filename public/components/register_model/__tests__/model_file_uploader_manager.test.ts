/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { waitFor } from '@testing-library/dom';
import { Model } from '../../../../public/apis/model';
import { ModelFileUploadManager } from '../model_file_upload_manager';

describe('ModelFileUploadManager', () => {
  const uploadChunkMock = jest.fn();

  beforeEach(() => {
    jest.spyOn(Model.prototype, 'uploadChunk').mockImplementation(uploadChunkMock);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should upload file by chunk', async () => {
    const uploader = new ModelFileUploadManager();
    const file = new File(['test model file'], 'model.zip', { type: 'application/zip' });
    Object.defineProperty(file, 'size', { value: 30 * 1000 * 1000 });

    uploader.upload({
      modelId: 'test model id',
      file,
      chunkSize: 10 * 1000 * 1000,
    });
    await waitFor(() => expect(uploadChunkMock).toHaveBeenCalledTimes(3));
  });

  it('should call onUpdate', async () => {
    const onUpdateMock = jest.fn();
    const uploader = new ModelFileUploadManager();
    const file = new File(['test model file'], 'model.zip', { type: 'application/zip' });
    Object.defineProperty(file, 'size', { value: 30 * 1000 * 1000 });

    uploader.upload({
      modelId: 'test model id',
      file,
      chunkSize: 10 * 1000 * 1000,
      onUpdate: onUpdateMock,
    });
    await waitFor(() => {
      expect(onUpdateMock).toHaveBeenNthCalledWith(1, { total: 3, current: 1 });
      expect(onUpdateMock).toHaveBeenNthCalledWith(2, { total: 3, current: 2 });
      expect(onUpdateMock).toHaveBeenNthCalledWith(3, { total: 3, current: 3 });
    });
  });

  it('should call onComplete', async () => {
    const functionCallOrder: string[] = [];
    const onCompleteMock = jest.fn().mockImplementation(() => functionCallOrder.push('onComplete'));
    const onUpdateMock = jest.fn().mockImplementation(() => functionCallOrder.push('onUpdate'));

    const uploader = new ModelFileUploadManager();
    const file = new File(['test model file'], 'model.zip', { type: 'application/zip' });
    Object.defineProperty(file, 'size', { value: 30 * 1000 * 1000 });

    uploader.upload({
      modelId: 'test model id',
      file,
      chunkSize: 10 * 1000 * 1000,
      onComplete: onCompleteMock,
      onUpdate: onUpdateMock,
    });
    await waitFor(() => expect(onCompleteMock).toHaveBeenCalled());
    expect(functionCallOrder).toEqual(['onUpdate', 'onUpdate', 'onUpdate', 'onComplete']);
  });

  it('should call onError', async () => {
    jest.spyOn(Model.prototype, 'uploadChunk').mockRejectedValue(new Error());
    const onErrorMock = jest.fn();
    const uploader = new ModelFileUploadManager();
    const file = new File(['test model file'], 'model.zip', { type: 'application/zip' });
    Object.defineProperty(file, 'size', { value: 30 * 1000 * 1000 });

    uploader.upload({
      modelId: 'test model id',
      file,
      chunkSize: 10 * 1000 * 1000,
      onError: onErrorMock,
    });
    await waitFor(() => expect(onErrorMock).toHaveBeenCalled());
  });
});
