/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { Observable, timer, BehaviorSubject } from 'rxjs';
import { takeWhile, switchMap } from 'rxjs/operators';
import { APIProvider } from '../../apis/api_provider';
import { TaskGetOneResponse } from '../../apis/task';

interface TaskQueryOptions {
  taskId: string;
  onUpdate?: (status: TaskGetOneResponse) => void;
  onError?: (err: Error) => void;
  onComplete?: (modelId: string) => void;
}

// Model download task is still running if
// 1. model id doesn't exist
// 2. the current task is running fine without error
function isTaskRunning(res: TaskGetOneResponse) {
  return !Boolean(res.model_id) && !Boolean(res.error);
}

export class ModelTaskManager {
  /**
   * The model download tasks which are still running in BE
   */
  tasks = new BehaviorSubject<Map<string, Observable<TaskGetOneResponse>>>(new Map());

  constructor() {}

  remove(taskId: string) {
    this.tasks.getValue().delete(taskId);
    this.tasks.next(this.tasks.getValue());
  }

  add(taskId: string, taskObservable: Observable<TaskGetOneResponse>) {
    if (!this.tasks.getValue().has(taskId)) {
      this.tasks.next(this.tasks.getValue().set(taskId, taskObservable));
    }
  }

  query(options: TaskQueryOptions) {
    if (!this.tasks.getValue().has(options.taskId)) {
      const observable = timer(0, 2000)
        .pipe(switchMap((_) => APIProvider.getAPI('task').getOne(options.taskId)))
        // TODO: should it also check res.state?
        // The intention here is to stop polling once a model is created
        .pipe(takeWhile((res) => !Boolean(res.model_id) && !Boolean(res.error), true));

      observable.subscribe({
        next: (res) => {
          if (options.onUpdate && !res.error) {
            options.onUpdate(res);
          }

          if (isTaskRunning(res)) {
            this.add(options.taskId, observable);
          } else {
            this.remove(options.taskId);
          }
          // Model download task is complete if model id exists
          if (res.model_id && options.onComplete) {
            options.onComplete(res.model_id);
          }

          if (res.error && options.onError) {
            options.onError(new Error(res.error));
          }
        },
        error: (err: Error) => {
          this.remove(options.taskId);
          if (options.onError) {
            options.onError(err);
          }
        },
      });
    }
  }

  getTasks$() {
    return this.tasks.asObservable();
  }
}

export const modelTaskManager = new ModelTaskManager();
