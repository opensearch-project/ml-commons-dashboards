/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import userEvent from '@testing-library/user-event';

import { RegisterModelForm } from '../register_model';
import type { RegisterModelFormProps } from '../register_model';
import { render, screen } from '../../../../test/test_utils';

export async function setup({ onSubmit }: RegisterModelFormProps) {
  render(<RegisterModelForm onSubmit={onSubmit} />);
  const nameInput = screen.getByLabelText<HTMLInputElement>(/model name/i);
  const versionInput = screen.getByLabelText<HTMLInputElement>(/version/i);
  const descriptionInput = screen.getByLabelText<HTMLTextAreaElement>(/model description/i);
  const annotationsInput = screen.getByLabelText<HTMLTextAreaElement>(/annotations\(optional\)/i);
  const submitButton = screen.getByRole<HTMLButtonElement>('button', {
    name: /register model/i,
  });
  const modelFileInput = screen.getByLabelText<HTMLInputElement>(/model file/i);
  const configurationInput = screen.getByLabelText(/configuration object/i);
  const metricNameInput = screen.getByLabelText(/metric name/i);
  const trainingMetricValueInput = screen.getByLabelText(/training metric value/i);
  const validationMetricValueInput = screen.getByLabelText(/validation metric value/i);
  const testingMetricValueInput = screen.getByLabelText(/testing metric value/i);
  const tagKeyInput = screen.getByLabelText(/^key$/i);
  const tagValueInput = screen.getByLabelText(/^value$/i);
  const form = screen.getByTestId('mlCommonsPlugin-registerModelForm');
  const user = userEvent.setup();

  // fill model name
  await user.type(nameInput, 'test model name');
  // fill model description
  await user.type(descriptionInput, 'test model description');
  // fill model file
  await user.upload(
    modelFileInput,
    new File(['test model file'], 'model.zip', { type: 'application/zip' })
  );

  return {
    nameInput,
    versionInput,
    descriptionInput,
    annotationsInput,
    configurationInput,
    submitButton,
    modelFileInput,
    metricNameInput,
    trainingMetricValueInput,
    validationMetricValueInput,
    testingMetricValueInput,
    tagKeyInput,
    tagValueInput,
    form,
    user,
  };
}
