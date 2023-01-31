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
export const PROFILE_API_ENDPOINT = `${API_PREFIX}/profile`;
export const DEPLOYED_MODEL_PROFILE_API_ENDPOINT = `${PROFILE_API_ENDPOINT}/deployed-model`;
export const CONNECTOR_API_ENDPOINT = `${API_PREFIX}/connector`;
export const INTERNAL_CONNECTOR_API_ENDPOINT = `${API_PREFIX}/internal-connector`;
