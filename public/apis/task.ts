/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { TASK_API_ENDPOINT } from '../../server/routes/constants';
import { InnerHttpProvider } from './inner_http_provider';

export interface TaskGetOneResponse {
  error?: string;
  last_update_time: number;
  create_time: number;
  is_async: boolean;
  function_name: string;
  state: string;
  model_id?: string;
  task_type: string;
  worker_node: string[];
}

export interface TaskSearchResponse {
  data: TaskGetOneResponse[];
  total_tasks: {};
}

export class Task {
  public getOne(taskId: string) {
    return InnerHttpProvider.getHttp().get<TaskGetOneResponse>(`${TASK_API_ENDPOINT}/${taskId}`);
  }

  public search(query: {
    from: number;
    size: number;
    modelId?: string;
    taskType?: string;
    state?: string;
    sort?:
      | 'last_update_time-desc'
      | 'last_update_time-asc'
      | Array<'last_update_time-desc' | 'last_update_time-asc'>;
  }) {
    const { modelId, taskType, ...restQuery } = query;
    return InnerHttpProvider.getHttp().get<TaskSearchResponse>(TASK_API_ENDPOINT, {
      query: {
        ...restQuery,
        model_id: modelId,
        task_type: taskType,
      },
    });
  }
}
