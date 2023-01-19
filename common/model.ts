/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

export enum MODEL_STATE {
  loaded = 'LOADED',
  trained = 'TRAINED',
  unloaded = 'UNLOADED',
  uploaded = 'UPLOADED',
  uploading = 'UPLOADING',
  loading = 'LOADING',
  partialLoaded = 'PARTIAL_LOADED',
  loadFailed = 'LOAD_FAILED',
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
}
