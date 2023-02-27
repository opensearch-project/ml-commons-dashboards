/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { waitFor } from '../../../../test/test_utils';
import { Task } from '../../../../public/apis/task';

import { ModelTaskManager } from '../model_task_manager';

describe('ModelTaskManager', () => {
  const getOneMock = jest.fn();

  beforeEach(() => {
    jest.spyOn(Task.prototype, 'getOne').mockImplementation(getOneMock);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should call onComplete if model task complete successfully', async () => {
    const onCompleteMock = jest.fn();
    const onErrorMock = jest.fn();
    const onUpdateMock = jest.fn();
    const res = { model_id: 'model_id' };
    getOneMock.mockResolvedValue(res);

    const taskManager = new ModelTaskManager();
    taskManager.query({
      taskId: 'task_id',
      onComplete: onCompleteMock,
      onError: onErrorMock,
      onUpdate: onUpdateMock,
    });

    await waitFor(() => {
      expect(onCompleteMock).toHaveBeenCalledWith(res);
      expect(onUpdateMock).toHaveBeenCalledWith(res);
      expect(onErrorMock).not.toHaveBeenCalled();
    });
  });

  it('should call onError if model task complete with error', async () => {
    const onCompleteMock = jest.fn();
    const onErrorMock = jest.fn();
    const onUpdateMock = jest.fn();
    const res = { error: 'error msg' };
    getOneMock.mockResolvedValue(res);

    const taskManager = new ModelTaskManager();
    taskManager.query({
      taskId: 'task_id',
      onComplete: onCompleteMock,
      onError: onErrorMock,
      onUpdate: onUpdateMock,
    });

    await waitFor(() => {
      expect(onCompleteMock).not.toHaveBeenCalled();
      expect(onUpdateMock).not.toHaveBeenCalled();
      expect(onErrorMock).toHaveBeenCalled();
    });
  });

  it('should poll get task API util model is created', async () => {
    const onCompleteMock = jest.fn();
    const onErrorMock = jest.fn();
    const onUpdateMock = jest.fn();
    const res = { model_id: 'model_id' };
    // 1st call -> {}, model is not created
    // 2nd call -> {}, model is not created
    // 3rd call -> { model_id: 'model_id' }, model is created
    getOneMock.mockResolvedValue(res).mockResolvedValueOnce({}).mockResolvedValueOnce({});

    const taskManager = new ModelTaskManager();
    taskManager.query({
      taskId: 'task_id',
      onComplete: onCompleteMock,
      onError: onErrorMock,
      onUpdate: onUpdateMock,
    });

    await waitFor(
      () => {
        expect(onCompleteMock).toHaveBeenCalledWith(res);
        expect(onUpdateMock).toHaveBeenCalledWith(res);
        expect(onErrorMock).not.toHaveBeenCalled();
      },
      { timeout: 8000 }
    );
    expect(getOneMock).toHaveBeenCalledTimes(3);
  });
});
