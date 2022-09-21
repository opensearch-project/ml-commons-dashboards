/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { generateTermQuery, generateMustQueries } from './query';

export const convertTaskSource = (source: {
  last_update_time: number;
  create_time: number;
  is_async: boolean;
  function_name: string;
  input_type: string;
  worker_node: string;
  state: string;
  model_id: string;
  task_type: string;
}) => ({
  lastUpdateTime: source.last_update_time,
  createTime: source.create_time,
  isAsync: source.is_async,
  functionName: source.function_name,
  inputType: source.input_type,
  workerNode: source.worker_node,
  state: source.state,
  modelId: source.model_id,
  taskType: source.task_type,
});

export const generateTaskSearchQuery = ({
  ids,
  modelId,
  functionName,
  createdStart,
  createdEnd,
}: {
  ids?: string[];
  modelId?: string;
  functionName?: string;
  createdStart?: number;
  createdEnd?: number;
}) =>
  generateMustQueries([
    ...(ids ? [{ ids: { values: ids } }] : []),
    ...(functionName ? [generateTermQuery('function_name', functionName)] : []),
    ...(modelId
      ? [
          {
            wildcard: {
              model_id: {
                value: `*${modelId}*`,
              },
            },
          },
        ]
      : []),
    ...(createdStart || createdEnd
      ? [
          {
            range: {
              create_time: {
                ...(createdStart ? { gte: createdStart } : {}),
                ...(createdEnd ? { lte: createdEnd } : {}),
              },
            },
          },
        ]
      : []),
  ]);
