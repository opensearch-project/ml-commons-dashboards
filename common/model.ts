/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

// TODO: rename the enum keys accordingly
export enum MODEL_STATE {
  loaded = 'DEPLOYED',
  trained = 'TRAINED',
  unloaded = 'UNDEPLOYED',
  uploaded = 'REGISTERED',
  uploading = 'REGISTERING',
  loading = 'DEPLOYING',
  partiallyLoaded = 'PARTIALLY_DEPLOYED',
  loadFailed = 'DEPLOY_FAILED',
  registerFailed = 'REGISTER_FAILED',
}

export interface OpenSearchModelBase {
  name: string;
  model_id: string;
  model_state: MODEL_STATE;
  model_version: string;
}

export interface OpenSearchSelfTrainedModel extends OpenSearchModelBase {
  algorithm: string;
}

export interface OpenSearchCustomerModel extends OpenSearchModelBase {
  algorithm: string;
  chunk_number: number;
  created_time: number;
  description: string;
  last_loaded_time?: number;
  last_unloaded_time?: number;
  last_uploaded_time: number;
  model_config: {
    all_config?: string;
    embedding_dimension: number;
    framework_type: string;
    model_type: string;
  };
  model_content: string;
  model_content_hash_value: string;
  model_content_size_in_bytes: string;
  model_format: string;
  total_chunks: number;
  version: number;
  planning_worker_nodes: string[];
}

export type ModelSearchSort =
  | 'version-desc'
  | 'version-asc'
  | 'name-asc'
  | 'name-desc'
  | 'id-asc'
  | 'model_state-asc'
  | 'model_state-desc'
  | 'id-desc';
