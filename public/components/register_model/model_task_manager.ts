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
  onComplete?: (status: TaskGetOneResponse) => void;
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

  query(options: TaskQueryOptions) {
    if (!this.tasks.getValue().has(options.taskId)) {
      const observable = timer(0, 2000)
        .pipe(switchMap((_) => APIProvider.getAPI('task').getOne(options.taskId)))
        // TODO: should it also check res.state?
        // The intention here is to stop polling once a model is created
        .pipe(takeWhile((res) => !Boolean(res.model_id), true));

      observable.subscribe({
        next: (res) => {
          if (options.onUpdate && !res.error) {
            options.onUpdate(res);
          }
          // Model download task is still running if
          // 1. model id doesn't exist
          // 2. the current task is running fine without error
          if (!res.model_id && !res.error) {
            this.tasks.next(this.tasks.getValue().set(options.taskId, observable));
          }
          // Model download task is complete if model id exists
          if (res.model_id && options?.onComplete) {
            options?.onComplete(res);
            this.remove(options.taskId);
          }
          if (res.error && options?.onError) {
            options?.onError(new Error(res.error));
            this.remove(options.taskId);
          }
        },
        error: (err: Error) => {
          if (options.onError) {
            options.onError(err);
            this.remove(options.taskId);
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
