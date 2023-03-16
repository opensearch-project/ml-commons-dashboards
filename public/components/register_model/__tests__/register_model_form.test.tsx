/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

import { render, screen, waitFor } from '../../../../test/test_utils';
import { setup } from './setup';
import { Model } from '../../../../public/apis/model';
import * as PluginContext from '../../../../../../src/plugins/opensearch_dashboards_react/public';
import * as formAPI from '../register_model_api';

// Cannot spyOn(PluginContext, 'useOpenSearchDashboards') directly as it results in error:
// TypeError: Cannot redefine property: useOpenSearchDashboards
// So we have to mock the entire module first as a workaround
jest.mock('../../../../../../src/plugins/opensearch_dashboards_react/public', () => {
  return {
    __esModule: true,
    ...jest.requireActual('../../../../../../src/plugins/opensearch_dashboards_react/public'),
  };
});
jest.mock('../../../apis/model_repository');

const MOCKED_DATA = {
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
  model_content_hash_value: '9376c2ebd7c83f99ec2526323786c348d2382e6d86576f750c89ea544d6bbb14',
  current_worker_node_count: 1,
  planning_worker_node_count: 1,
};

describe('<RegisterModel /> Form', () => {
  const MOCKED_MODEL_ID = 'model_id';
  const addDangerMock = jest.fn();
  const addSuccessMock = jest.fn();
  const onSubmitMock = jest.fn().mockResolvedValue(MOCKED_MODEL_ID);

  beforeEach(() => {
    jest.spyOn(PluginContext, 'useOpenSearchDashboards').mockReturnValue({
      services: {
        notifications: {
          toasts: {
            addDanger: addDangerMock,
            addSuccess: addSuccessMock,
          },
        },
      },
    });
    jest.spyOn(formAPI, 'submitModelWithFile').mockImplementation(onSubmitMock);
    jest.spyOn(Model.prototype, 'uploadChunk').mockResolvedValue({});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should init form when id param in url route', async () => {
    const mockResult = MOCKED_DATA;
    jest.spyOn(Model.prototype, 'getOne').mockResolvedValue(mockResult);
    await setup({ route: '/test_model_id', mode: 'version' });

    const { name } = mockResult;

    await waitFor(() => {
      expect(screen.getByText<HTMLInputElement>(name)).toBeInTheDocument();
    });
  });

  it('submit button label should be `Register version` when register new version', async () => {
    jest.spyOn(Model.prototype, 'getOne').mockResolvedValue(MOCKED_DATA);

    await setup({ route: '/test_model_id', mode: 'version' });

    expect(screen.getByRole('button', { name: /register version/i })).toBeInTheDocument();
  });

  it('submit button label should be `Register model` when import a model', async () => {
    await setup({
      route: '/?type=import&name=sentence-transformers/all-distilroberta-v1',
      mode: 'import',
    });
    expect(screen.getByRole('button', { name: /register model/i })).toBeInTheDocument();
  });

  it('should call submitModelWithURL with pre-filled model data after register model button clicked', async () => {
    jest.spyOn(formAPI, 'submitModelWithURL').mockImplementation(onSubmitMock);
    const { user } = await setup({
      route: '/?type=import&name=sentence-transformers/all-distilroberta-v1',
      mode: 'import',
    });
    await waitFor(() =>
      expect(screen.getByLabelText<HTMLInputElement>(/^name$/i).value).toEqual(
        'sentence-transformers/all-distilroberta-v1'
      )
    );
    expect(onSubmitMock).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: /register model/i }));
    expect(onSubmitMock).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'sentence-transformers/all-distilroberta-v1',
        description:
          'This is a sentence-transformers model: It maps sentences & paragraphs to a 768 dimensional dense vector space and can be used for tasks like clustering or semantic search.',
        modelURL:
          'https://artifacts.opensearch.org/models/ml-models/huggingface/sentence-transformers/all-distilroberta-v1/1.0.1/torch_script/sentence-transformers_all-distilroberta-v1-1.0.1-torch_script.zip',
        configuration: expect.stringContaining('sentence_transformers'),
      })
    );
  });

  it('submit button label should be `Register model` when register new model', async () => {
    await setup();
    expect(screen.getByRole('button', { name: /register model/i })).toBeInTheDocument();
  });

  it('should display number of form errors in form footer', async () => {
    const { user, nameInput } = await setup();
    await user.clear(nameInput);
    await user.click(screen.getByRole('button', { name: /register model/i }));
    expect(screen.queryByText(/1 form error/i)).toBeInTheDocument();

    await user.type(nameInput, 'test model name');
    expect(screen.queryByText(/1 form error/i)).not.toBeInTheDocument();
  });

  it('should call addSuccess to display a success toast', async () => {
    const { user } = await setup();
    await user.click(screen.getByRole('button', { name: /register model/i }));
    expect(addSuccessMock).toHaveBeenCalled();
  });

  it('should navigate to model group page when submit succeed', async () => {
    const { user } = await setup();
    await user.click(screen.getByRole('button', { name: /register model/i }));
    expect(location.href).toContain(`model-registry/model/${MOCKED_MODEL_ID}`);
  });

  it('should call addDanger to display an error toast', async () => {
    jest.spyOn(formAPI, 'submitModelWithFile').mockRejectedValue(new Error('error'));
    const { user } = await setup();
    await user.click(screen.getByRole('button', { name: /register model/i }));
    expect(addDangerMock).toHaveBeenCalled();
  });
});
