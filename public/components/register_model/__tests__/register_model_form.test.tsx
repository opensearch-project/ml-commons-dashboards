/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Route } from 'react-router-dom';

import { render, screen, waitFor } from '../../../../test/test_utils';
import { RegisterModelForm } from '../register_model';
import { APIProvider } from '../../../apis/api_provider';
import { routerPaths } from '../../../../common/router_paths';
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

const MOCKED_DATA = {
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
      model_content_hash_value: '9376c2ebd7c83f99ec2526323786c348d2382e6d86576f750c89ea544d6bbb14',
      current_worker_node_count: 1,
      planning_worker_node_count: 1,
    },
  ],
  pagination: { currentPage: 1, pageSize: 1, totalRecords: 1, totalPages: 1 },
};

describe('<RegisterModel /> Form', () => {
  const addDangerMock = jest.fn();
  const addSuccessMock = jest.fn();
  const onSubmitMock = jest.fn();

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
    const request = jest.spyOn(APIProvider.getAPI('model'), 'search');
    const mockResult = MOCKED_DATA;
    request.mockResolvedValue(mockResult);
    render(
      <Route path={routerPaths.registerModel}>
        <RegisterModelForm />
      </Route>,
      { route: '/model-registry/register-model/test_model_id' }
    );

    const { name } = mockResult.data[0];

    await waitFor(() => {
      const nameInput = screen.getByLabelText<HTMLInputElement>(/^name$/i);
      expect(nameInput.value).toBe(name);
    });
  });

  it('submit button label should be `Register version` when register new version', async () => {
    const request = jest.spyOn(APIProvider.getAPI('model'), 'search');
    const mockResult = MOCKED_DATA;
    request.mockResolvedValue(mockResult);

    render(
      <Route path={routerPaths.registerModel}>
        <RegisterModelForm />
      </Route>,
      { route: '/model-registry/register-model/test_model_id' }
    );

    expect(screen.getByRole('button', { name: /register version/i })).toBeInTheDocument();
  });

  it('submit button label should be `Register model` when import a model', async () => {
    render(
      <Route path={routerPaths.registerModel}>
        <RegisterModelForm />
      </Route>,
      { route: '/model-registry/register-model?type=import' }
    );
    expect(screen.getByRole('button', { name: /register model/i })).toBeInTheDocument();
  });

  it('submit button label should be `Register model` when register new model', async () => {
    render(
      <Route path={routerPaths.registerModel}>
        <RegisterModelForm />
      </Route>,
      { route: '/model-registry/register-model' }
    );
    expect(screen.getByRole('button', { name: /register model/i })).toBeInTheDocument();
  });

  it('should display number of form errors in form footer', async () => {
    const { user, nameInput, descriptionInput } = await setup();
    await user.clear(nameInput);
    await user.clear(descriptionInput);
    await user.click(screen.getByRole('button', { name: /register model/i }));
    expect(screen.queryByText(/2 form errors/i)).toBeInTheDocument();

    await user.type(nameInput, 'test model name');
    expect(screen.queryByText(/1 form error/i)).toBeInTheDocument();
  });

  it('should call addSuccess to display a success toast', async () => {
    const { user } = await setup();
    await user.click(screen.getByRole('button', { name: /register model/i }));
    expect(addSuccessMock).toHaveBeenCalled();
  });

  it('should call addDanger to display an error toast', async () => {
    jest.spyOn(formAPI, 'submitModelWithFile').mockRejectedValue(new Error('error'));
    const { user } = await setup();
    await user.click(screen.getByRole('button', { name: /register model/i }));
    expect(addDangerMock).toHaveBeenCalled();
  });
});
