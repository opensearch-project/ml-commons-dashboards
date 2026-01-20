/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

export const modelConfig = {
  name: 'sentence-transformers/all-distilroberta-v1',
  version: '1.0.1',
  description:
    'This is a sentence-transformers model: It maps sentences & paragraphs to a 768 dimensional dense vector space and can be used for tasks like clustering or semantic search.',
  model_task_type: 'TEXT_EMBEDDING',
  model_format: 'TORCH_SCRIPT',
  model_content_size_in_bytes: 330811571,
  model_content_hash_value: '92bc10216c720b57a6bab1d7ca2cc2e559156997212a7f0d8bb70f2edfedc78b',
  model_config: {
    model_type: 'roberta',
    embedding_dimension: 768,
    framework_type: 'sentence_transformers',
    all_config:
      '{"_name_or_path":"distilroberta-base","architectures":["RobertaForMaskedLM"],"attention_probs_dropout_prob":0.1,"bos_token_id":0,"eos_token_id":2,"gradient_checkpointing":false,"hidden_act":"gelu","hidden_dropout_prob":0.1,"hidden_size":768,"initializer_range":0.02,"intermediate_size":3072,"layer_norm_eps":0.00001,"max_position_embeddings":514,"model_type":"roberta","num_attention_heads":12,"num_hidden_layers":6,"pad_token_id":1,"position_embedding_type":"absolute","transformers_version":"4.8.2","type_vocab_size":1,"use_cache":true,"vocab_size":50265}',
  },
  created_time: 1676072210947,
};
