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

export class Task {
  public getOne(taskId: string) {
    return InnerHttpProvider.getHttp().get<TaskGetOneResponse>(`${TASK_API_ENDPOINT}/${taskId}`);
  }
}
