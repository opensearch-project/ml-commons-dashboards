/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import userEvent from '@testing-library/user-event';

import { RegisterModelForm } from '../register_model';
import { render, RenderWithRouteProps, screen } from '../../../../test/test_utils';

jest.mock('../../../apis/model');
jest.mock('../../../apis/task');

export async function setup(options?: RenderWithRouteProps) {
  render(<RegisterModelForm />, { route: options?.route ?? '/' });
  const nameInput = screen.getByLabelText<HTMLInputElement>(/^name$/i);
  const descriptionInput = screen.getByLabelText<HTMLTextAreaElement>(/description/i);
  const submitButton = screen.getByRole<HTMLButtonElement>('button', {
    name: /register model/i,
  });
  const modelFileInput = screen.queryByLabelText<HTMLInputElement>(/file/i);
  const form = screen.getByTestId('mlCommonsPlugin-registerModelForm');
  const user = userEvent.setup();
  const versionNotesInput = screen.getByLabelText<HTMLTextAreaElement>(/notes/i);

  // fill model name
  await user.type(nameInput, 'test model name');
  // fill model description
  await user.type(descriptionInput, 'test model description');
  // fill model file
  if (modelFileInput) {
    await user.upload(
      modelFileInput,
      new File(['test model file'], 'model.zip', { type: 'application/zip' })
    );
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
