/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { render, screen, waitFor } from '../../../../test/test_utils';
import { RegisterModelForm } from '../register_model';
import { APIProvider } from '../../../apis/api_provider';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({
    id: 'test_model_id',
  }),
}));

describe('<RegisterModel /> Form', () => {
  it('should init form when id param in url route', async () => {
    const request = jest.spyOn(APIProvider.getAPI('model'), 'search');
    const mockResult = {
      data: [
        {
          id: 'C7jN0YQBjgpeQQ_RmiDE',
          model_version: '1.0.7',
          created_time: 1669967223491,
          model_config: {
            all_config:
              '{"_name_or_path":"nreimers/MiniLM-L6-H384-uncased","architectures":["BertModel"],"attention_probs_dropout_prob":0.1,"gradient_checkpointing":false,"hidden_act":"gelu","hidden_dropout_prob":0.1,"hidden_size":384,"initializer_range":0.02,"intermediate_size":1536,"layer_norm_eps":1e-12,"max_position_embeddings":512,"model_type":"bert","num_attention_heads":12,"num_hidden_layers":6,"pad_token_id":0,"position_embedding_type":"absolute","transformers_version":"4.8.2","type_vocab_size":2,"use_cache":true,"vocab_size":30522}',
            model_type: 'bert',
            embedding_dimension: 384,
            framework_type: 'SENTENCE_TRANSFORMERS',
          },
          last_loaded_time: 1672895017422,
          model_format: 'TORCH_SCRIPT',
          last_uploaded_time: 1669967226531,
          name: 'all-MiniLM-L6-v2',
          model_state: 'LOADED',
          total_chunks: 9,
          model_content_size_in_bytes: 83408741,
          algorithm: 'TEXT_EMBEDDING',
          model_content_hash_value:
            '9376c2ebd7c83f99ec2526323786c348d2382e6d86576f750c89ea544d6bbb14',
          current_worker_node_count: 1,
          planning_worker_node_count: 1,
        },
      ],
      pagination: { currentPage: 1, pageSize: 1, totalRecords: 1, totalPages: 1 },
    };
    request.mockResolvedValue(mockResult);
    render(<RegisterModelForm />);

    const { name, model_version } = mockResult.data[0];

    await waitFor(() => {
      const nameInput = screen.getByLabelText<HTMLInputElement>(/model name/i);
      const versionInput = screen.getByLabelText<HTMLInputElement>(/version/i);

      expect(nameInput.value).toBe(name);
      expect(versionInput.value).toBe(model_version);
    });
  });
});
