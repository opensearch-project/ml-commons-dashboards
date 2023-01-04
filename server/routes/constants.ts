/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

export const API_PREFIX = '/api/ml-commons';

export const MODEL_API_ENDPOINT = `${API_PREFIX}/model`;
export const MODEL_LOAD_API_ENDPOINT = `${API_PREFIX}/model/load`;
export const MODEL_UNLOAD_API_ENDPOINT = `${API_PREFIX}/model/unload`;
export const MODEL_PROFILE_API_ENDPOINT = `${API_PREFIX}/model/profile`;
export const MODEL_UPLOAD_API_ENDPOINT = `${MODEL_API_ENDPOINT}/upload`;
export const MODEL_AGGREGATE_API_ENDPOINT = `${API_PREFIX}/model-aggregate`;
export const TASK_API_ENDPOINT = `${API_PREFIX}/task`;
export const TRAIN_API_ENDPOINT = `${API_PREFIX}/train`;
export const MODEL_ALGORITHM_API_ENDPOINT = `${API_PREFIX}/model-algorithm`;
export const TASK_FUNCTION_API_ENDPOINT = `${API_PREFIX}/task-function`;
export const TASK_STATE_API_ENDPOINT = `${API_PREFIX}/task-state`;
export const PREDICT_API_ENDPOINT = `${API_PREFIX}/predict`;
export const PROFILE_API_ENDPOINT = `${API_PREFIX}/profile`;
export const DEPLOYED_MODEL_PROFILE_API_ENDPOINT = `${PROFILE_API_ENDPOINT}/deployed-model`;
export const SPECIFIC_MODEL_PROFILE_API_ENDPOINT = `${PROFILE_API_ENDPOINT}/model`;
