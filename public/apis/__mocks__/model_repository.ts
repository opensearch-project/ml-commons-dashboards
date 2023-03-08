/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

export class ModelRepository {
  public getPreTrainedModels() {
    return Promise.resolve({
      'sentence-transformers/all-distilroberta-v1': {
        version: '1.0.1',
        description:
          'This is a sentence-transformers model: It maps sentences & paragraphs to a 768 dimensional dense vector space and can be used for tasks like clustering or semantic search.',
        torch_script: {
          model_url:
            'https://artifacts.opensearch.org/models/ml-models/huggingface/sentence-transformers/all-distilroberta-v1/1.0.1/torch_script/sentence-transformers_all-distilroberta-v1-1.0.1-torch_script.zip',
          config_url:
            'https://artifacts.opensearch.org/models/ml-models/huggingface/sentence-transformers/all-distilroberta-v1/1.0.1/torch_script/config.json',
        },
        onnx: {
          model_url:
            'https://artifacts.opensearch.org/models/ml-models/huggingface/sentence-transformers/all-distilroberta-v1/1.0.1/onnx/sentence-transformers_all-distilroberta-v1-1.0.1-onnx.zip',
          config_url:
            'https://artifacts.opensearch.org/models/ml-models/huggingface/sentence-transformers/all-distilroberta-v1/1.0.1/onnx/config.json',
        },
      },
    });
  }

  public getPreTrainedModelConfig() {
    return Promise.resolve({
      name: 'sentence-transformers/msmarco-distilbert-base-tas-b',
      version: '1.0.1',
      description:
        'This is a port of the DistilBert TAS-B Model to sentence-transformers model: It maps sentences & paragraphs to a 768 dimensional dense vector space and is optimized for the task of semantic search.',
      model_task_type: 'TEXT_EMBEDDING',
      model_format: 'TORCH_SCRIPT',
      model_content_size_in_bytes: 266352827,
      model_content_hash_value: 'acdc81b652b83121f914c5912ae27c0fca8fabf270e6f191ace6979a19830413',
      model_config: {
        model_type: 'distilbert',
        embedding_dimension: 768,
        framework_type: 'sentence_transformers',
        all_config:
          '{"_name_or_path":"old_models/msmarco-distilbert-base-tas-b/0_Transformer","activation":"gelu","architectures":["DistilBertModel"],"attention_dropout":0.1,"dim":768,"dropout":0.1,"hidden_dim":3072,"initializer_range":0.02,"max_position_embeddings":512,"model_type":"distilbert","n_heads":12,"n_layers":6,"pad_token_id":0,"qa_dropout":0.1,"seq_classif_dropout":0.2,"sinusoidal_pos_embds":false,"tie_weights_":true,"transformers_version":"4.7.0","vocab_size":30522}',
      },
      created_time: 1676073973126,
    });
  }
}
