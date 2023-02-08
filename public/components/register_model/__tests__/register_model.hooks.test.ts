/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { renderHook } from '@testing-library/react-hooks';
import { Task, TaskGetOneResponse } from '../../../../public/apis/task';
import { Model } from '../../../../public/apis/model';
import * as getModelContentHashValueExports from '../get_model_content_hash_value';

import { useModelUpload } from '../register_model.hooks';

const modelBaseData = {
  name: 'foo',
  version: '1',
  description: 'foo bar',
  annotations: '',
  configuration: `{
    "foo":"bar"
  }`,
};

const modelUrlFormData = {
  ...modelBaseData,
  modelURL: 'http://localhost/',
};

const modelFileFormData = {
  ...modelBaseData,
  modelFile: new File(new Array(10000).fill(1), 'test-model'),
};
// Make file size to 30MB, so we can split 3 chunks to upload.
Object.defineProperty(modelFileFormData.modelFile, 'size', {
  get() {
    return 3 * 10000000;
  },
});

describe('useModelUpload', () => {
  describe('upload by url', () => {
    beforeEach(() => {
      jest.spyOn(Model.prototype, 'upload').mockResolvedValue({ task_id: 'task-id-1' });
      jest
        .spyOn(Task.prototype, 'getOne')
        .mockResolvedValue({ model_id: 'new-model-1' } as TaskGetOneResponse);
    });

    afterEach(() => {
      jest.spyOn(Model.prototype, 'upload').mockClear();
      jest.spyOn(Task.prototype, 'getOne').mockClear();
    });

    it('should call model upload with consistent params', () => {
      const { result } = renderHook(() => useModelUpload());
      const modelUploadMock = jest.spyOn(Model.prototype, 'upload');
      expect(modelUploadMock).not.toHaveBeenCalled();

      result.current(modelUrlFormData);

      expect(modelUploadMock).toHaveBeenCalledWith({
        name: 'foo',
        version: '1',
        description: 'foo bar',
        modelFormat: 'TORCH_SCRIPT',
        modelConfig: {
          foo: 'bar',
        },
        url: 'http://localhost/',
      });
    });

    it('should call get task cycling and resolved with model id when upload by url', async () => {
      jest.useFakeTimers();
      const { result } = renderHook(() => useModelUpload());

      const taskGetOneMock = jest
        .spyOn(Task.prototype, 'getOne')
        .mockResolvedValueOnce({} as TaskGetOneResponse);
      expect(taskGetOneMock).not.toHaveBeenCalled();

      const uploadPromise = result.current(modelUrlFormData);

      await jest.spyOn(Model.prototype, 'upload').mock.results[0].value;
      expect(taskGetOneMock).toHaveBeenCalledWith('task-id-1');

      await taskGetOneMock.mock.results[0].value;
      taskGetOneMock.mockResolvedValueOnce({ model_id: 'new-model-1' } as TaskGetOneResponse);
      jest.advanceTimersByTime(1000);

      expect(taskGetOneMock).toHaveBeenCalledTimes(2);
      expect(await uploadPromise).toBe('new-model-1');

      jest.useRealTimers();
    });

    it('should NOT call get task if component unmount', () => {
      const { result, unmount } = renderHook(() => useModelUpload());
      let uploadAPIResolveFn: Function;
      const uploadAPIPromise = new Promise<{ task_id: string }>((resolve, reject) => {
        uploadAPIResolveFn = () => {
          resolve({ task_id: 'task-id-1' });
        };
      });
      jest.spyOn(Model.prototype, 'upload').mockReturnValue(uploadAPIPromise);

      const uploadPromise = result.current(modelUrlFormData);
      unmount();
      uploadAPIResolveFn!();

      expect(jest.spyOn(Task.prototype, 'getOne')).not.toHaveBeenCalled();

      expect(uploadPromise).rejects.toMatch('component unmounted');
    });

    it('should NOT cycling call get task after component unmount', async () => {
      jest.useFakeTimers();
      const { result, unmount } = renderHook(() => useModelUpload());

      const taskGetOneMock = jest
        .spyOn(Task.prototype, 'getOne')
        .mockResolvedValue({} as TaskGetOneResponse);
      expect(taskGetOneMock).not.toHaveBeenCalled();

      const uploadPromise = result.current(modelUrlFormData);

      await jest.spyOn(Model.prototype, 'upload').mock.results[0].value;

      await taskGetOneMock.mock.results[0].value;
      expect(taskGetOneMock).toHaveBeenCalledTimes(1);
      unmount();

      jest.advanceTimersByTime(1000);

      expect(taskGetOneMock).toHaveBeenCalledTimes(1);
      expect(uploadPromise).rejects.toMatch('component unmounted');

      jest.useRealTimers();
    });
  });

  describe('upload by file', () => {
    beforeEach(() => {
      jest.spyOn(Model.prototype, 'upload').mockResolvedValue({ model_id: 'model-id-1' });
      jest.spyOn(Model.prototype, 'uploadChunk').mockResolvedValue({});
      jest
        .spyOn(getModelContentHashValueExports, 'getModelContentHashValue')
        .mockResolvedValue('file-hash');
    });

    afterEach(() => {
      jest.spyOn(Model.prototype, 'upload').mockClear();
      jest.spyOn(Model.prototype, 'uploadChunk').mockClear();
      jest.spyOn(getModelContentHashValueExports, 'getModelContentHashValue').mockClear();
    });

    it('should call model upload with consistent params', async () => {
      const { result } = renderHook(() => useModelUpload());

      expect(jest.spyOn(Model.prototype, 'upload')).not.toHaveBeenCalled();

      result.current(modelFileFormData);

      await jest.spyOn(getModelContentHashValueExports, 'getModelContentHashValue').mock.results[0]
        .value;
      await jest.spyOn(Model.prototype, 'upload').mock.results[0].value;

      expect(jest.spyOn(Model.prototype, 'upload')).toHaveBeenCalledWith({
        name: 'foo',
        version: '1',
        description: 'foo bar',
        modelFormat: 'TORCH_SCRIPT',
        modelConfig: {
          foo: 'bar',
        },
        modelContentHashValue: 'file-hash',
        totalChunks: 3,
      });
    });

    it('should call model uploadChunk for 3 times', async () => {
      const { result } = renderHook(() => useModelUpload());

      await result.current(modelFileFormData);

      expect(jest.spyOn(Model.prototype, 'uploadChunk')).toHaveBeenCalledTimes(3);
    });
  });
});
