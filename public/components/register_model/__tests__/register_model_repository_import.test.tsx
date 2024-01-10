/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import userEvent from '@testing-library/user-event';
import { Route } from 'react-router-dom';

import { render, screen, history, waitFor } from '../../../../test/test_utils';
import { RegisterModelForm } from '../register_model';
import { ModelRepository } from '../../../apis/model_repository';

describe('<RegisterModel /> Repository Import', () => {
  beforeEach(() => {
    jest.spyOn(ModelRepository.prototype, 'getPreTrainedModels').mockResolvedValue({
      foo: {
        description: 'foo',
        version: '1',
        torch_script: { model_url: '', config_url: '' },
        onnx: { model_url: '', config_url: '' },
      },
    });
    jest.spyOn(ModelRepository.prototype, 'getPreTrainedModelConfig').mockResolvedValue({});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render find model selector and disable "Register model" button', async () => {
    render(
      <Route path="/:id?">
        <RegisterModelForm />
      </Route>,
      { route: '/?type=import' }
    );

    await waitFor(() => {
      expect(screen.getByText('Find model')).toBeInTheDocument();
      expect(screen.queryByLabelText(/^name$/i)).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Register model' })).toBeDisabled();
    });
  });

  it('should update path with name params after model selected', async () => {
    render(
      <Route path="/:id?">
        <RegisterModelForm />
      </Route>,
      { route: '/?type=import' }
    );

    await userEvent.click(screen.getByText('Find model'));
    await userEvent.click(screen.getByRole('option', { name: 'foo' }));
    expect(history.current.location.search).toContain('name=foo');
  });
});
