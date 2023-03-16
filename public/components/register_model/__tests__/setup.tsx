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

jest.mock('../../../apis/task');

interface SetupOptions extends RenderWithRouteProps {
  mode?: 'model' | 'version' | 'import';
}

interface SetupReturn {
  nameInput: HTMLInputElement;
  descriptionInput: HTMLTextAreaElement;
  submitButton: HTMLButtonElement;
  form: HTMLElement;
  user: UserEvent;
  versionNotesInput: HTMLTextAreaElement;
}

export async function setup(options: {
  route: string;
  mode: 'version';
}): Promise<Omit<SetupReturn, 'nameInput' | 'descriptionInput'>>;
export async function setup(options?: {
  route: string;
  mode: 'model' | 'import';
}): Promise<SetupReturn>;
export async function setup(
  { route, mode }: SetupOptions = {
    route: '/',
    mode: 'model',
  }
) {
  render(
    <Route path="/:id?">
      <RegisterModelForm />
    </Route>,
    { route }
  );
  await waitFor(() => expect(screen.queryByLabelText('Model Form Loading')).toBe(null));
  const nameInput = screen.queryByLabelText<HTMLInputElement>(/^name$/i);
  const descriptionInput = screen.queryByLabelText<HTMLTextAreaElement>(/description/i);
  const submitButton = screen.getByRole<HTMLButtonElement>('button', {
    name: mode === 'version' ? /register version/i : /register model/i,
  });
  const modelFileInput = screen.queryByLabelText<HTMLInputElement>(/file/i);
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
