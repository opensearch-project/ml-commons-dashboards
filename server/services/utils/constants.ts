/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

/*
 *   Copyright OpenSearch Contributors
 *
 *   Licensed under the Apache License, Version 2.0 (the "License").
 *   You may not use this file except in compliance with the License.
 *   A copy of the License is located at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 *   or in the "license" file accompanying this file. This file is distributed
 *   on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 *   express or implied. See the License for the specific language governing
 *   permissions and limitations under the License.
 */

export const ML_COMMONS_API_PREFIX = '/_plugins/_ml';
export const PROFILE_BASE_API = `${ML_COMMONS_API_PREFIX}/profile`;
export const MODEL_BASE_API = `${ML_COMMONS_API_PREFIX}/models`;
export const MODEL_SEARCH_API = `${MODEL_BASE_API}/_search`;
export const MODEL_UPLOAD_API = `${MODEL_BASE_API}/_upload`;
export const MODEL_META_API = `${MODEL_BASE_API}/meta`;
export const MODEL_PROFILE_API = `${PROFILE_BASE_API}/models`;
export const PREDICT_BASE_API = `${ML_COMMONS_API_PREFIX}/_predict`;

export const SECURITY_API_PREFIX = '/_plugins/_security/api';
export const SECURITY_ACCOUNT_API = `${SECURITY_API_PREFIX}/account`;

export const CLUSTER = {
  TRAIN: 'opensearch_mlCommonsTrain',
  MODEL: 'opensearch_mlCommonsModel',
  TASK: 'opensearch_mlCommonsTask',
  PREDICT: 'opensearch_mlCommonsPredict',
};

export const CONNECTOR_BASE_API = `${ML_COMMONS_API_PREFIX}/connectors`;
export const CONNECTOR_SEARCH_API = `${CONNECTOR_BASE_API}/_search`;

export const MODEL_INDEX = '.plugins-ml-model';
