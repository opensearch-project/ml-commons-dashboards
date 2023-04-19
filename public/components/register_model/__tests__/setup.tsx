/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import userEvent from '@testing-library/user-event';
import { Route } from 'react-router-dom';
import { UserEvent } from '@testing-library/user-event/dist/types/setup/setup';

import { RegisterModelForm } from '../register_model';
import { Model } from '../../../apis/model';
import { render, RenderWithRouteProps, screen, waitFor } from '../../../../test/test_utils';
import { ModelFileFormData, ModelUrlFormData } from '../register_model.types';

jest.mock('../../../apis/task');

interface SetupOptions extends Partial<RenderWithRouteProps> {
  mode?: 'model' | 'version' | 'import';
  defaultValues?: Partial<ModelFileFormData> | Partial<ModelUrlFormData>;
}

interface SetupReturn {
  nameInput: HTMLInputElement;
  descriptionInput: HTMLTextAreaElement;
  submitButton: HTMLButtonElement;
  form: HTMLElement;
  user: UserEvent;
  versionNotesInput: HTMLTextAreaElement;
}

const CONFIGURATION = `{
  "model_type": "bert",
  "embedding_dimension": 384,
  "framework_type": "sentence_transformers"
}`;

const DEFAULT_VALUES = {
  name: '',
  description: '',
  version: '1',
  configuration: CONFIGURATION,
  tags: [{ key: '', value: '', type: 'string' as const }],
};

export async function setup(options: {
  route?: string;
  mode: 'version';
  defaultValues?: Partial<ModelFileFormData> | Partial<ModelUrlFormData>;
}): Promise<Omit<SetupReturn, 'nameInput' | 'descriptionInput'>>;
export async function setup(options?: {
  route?: string;
  mode?: 'model' | 'import';
  defaultValues?: Partial<ModelFileFormData> | Partial<ModelUrlFormData>;
}): Promise<SetupReturn>;
export async function setup(
  { route, mode, defaultValues }: SetupOptions = {
    route: '/',
    mode: 'model',
  }
) {
  render(
    <Route path="/:id?">
      <RegisterModelForm defaultValues={{ ...DEFAULT_VALUES, ...defaultValues }} />
    </Route>,
    { route: route ?? '/' }
  );
  await waitFor(() => expect(screen.queryByLabelText('Model Form Loading')).toBe(null));
  const nameInput = screen.queryByLabelText<HTMLInputElement>(/^name$/i);
  const descriptionInput = screen.queryByLabelText<HTMLTextAreaElement>(/description/i);
  const submitButton = screen.getByRole<HTMLButtonElement>('button', {
    name: mode === 'version' ? /register version/i : /register model/i,
  });
  const modelFileInput = screen.queryByLabelText<HTMLInputElement>(/^file$/i);
  const fileFormatInput = screen.queryByLabelText(/^Model file format$/i);
  const form = screen.getByTestId('mlCommonsPlugin-registerModelForm');
  const user = userEvent.setup();
  const versionNotesInput = screen.getByLabelText<HTMLTextAreaElement>(/notes/i);

  // fill model file
  if (modelFileInput) {
    await user.upload(
      modelFileInput,
      new File(['test model file'], 'model.zip', { type: 'application/zip' })
    );
  }

  if (fileFormatInput) {
    await user.click(fileFormatInput);
    await user.click(screen.getByText('ONNX(.onnx)'));
  }

  if (mode === 'version') {
    return {
      submitButton,
      form,
      user,
      versionNotesInput,
    };
  }

  if (!nameInput) {
    throw new Error('Name input not found');
  }
  if (!descriptionInput) {
    throw new Error('Description input not found');
  }

  // Mock model name unique
  jest.spyOn(Model.prototype, 'search').mockResolvedValue({ data: [], total_models: 0 });
  // fill model name
  if (mode === 'model') {
    await user.type(nameInput, 'test model name');
  }
  // fill model description
  if (mode === 'model') {
    await user.type(descriptionInput, 'test model description');
  }

  return {
    nameInput,
    descriptionInput,
    submitButton,
    form,
    user,
    versionNotesInput,
  };
}
