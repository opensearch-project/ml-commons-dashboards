/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import userEvent from '@testing-library/user-event';

import { render, screen } from '../../../../../../test/test_utils';
import { ModelConfiguration } from '../model_configuration';

const TestApp = ({
  configuration = '{}',
  readOnly = false,
  onSubmit = jest.fn(),
  onError = jest.fn(),
}: {
  configuration?: string;
  readOnly?: boolean;
  onSubmit?: () => any;
  onError?: () => any;
}) => {
  const form = useForm({
    defaultValues: {
      configuration,
    },
  });

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit, onError)}>
        <ModelConfiguration readOnly={readOnly} />
        <button type="submit">Submit</button>
      </form>
    </FormProvider>
  );
};

describe('<ModelConfiguration />', () => {
  it('should render a help flyout when click help button', async () => {
    const user = userEvent.setup();
    render(<TestApp />);

    expect(screen.getByLabelText('JSON configuration')).toBeInTheDocument();
    await user.click(screen.getByTestId('model-configuration-help-button'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('should display error if configuration is empty', async () => {
    const user = userEvent.setup();
    render(<TestApp configuration="" />);
    await user.click(screen.getByText('Submit'));
    expect(screen.getByText('Configuration is required.')).toBeInTheDocument();
  });

  it('should display error if configuration is NOT a valid JSON string', async () => {
    const user = userEvent.setup();
    render(<TestApp configuration='{"model_type": "roberta",}' />);
    await user.click(screen.getByText('Submit'));
    expect(screen.getByText('JSON is invalid. Enter a valid JSON')).toBeInTheDocument();
  });

  it('should display error if model_type is missing', async () => {
    const configuration = {
      embedding_dimension: 768,
      framework_type: 'SENTENCE_TRANSFORMERS',
    };
    const user = userEvent.setup();
    render(<TestApp configuration={JSON.stringify(configuration)} />);
    await user.click(screen.getByText('Submit'));
    expect(screen.getByText('model_type is required. Specify the model_type')).toBeInTheDocument();
  });

  it('should display error if model_type is invalid', async () => {
    const configuration = {
      model_type: 768,
      embedding_dimension: 768,
      framework_type: 'SENTENCE_TRANSFORMERS',
    };
    const user = userEvent.setup();
    render(<TestApp configuration={JSON.stringify(configuration)} />);
    await user.click(screen.getByText('Submit'));
    expect(screen.getByText('model_type must be a string')).toBeInTheDocument();
  });

  it('should display error if embedding_dimension is invalid', async () => {
    const configuration = {
      model_type: 'roberta',
      embedding_dimension: 'invalid_value',
      framework_type: 'SENTENCE_TRANSFORMERS',
    };
    const user = userEvent.setup();
    render(<TestApp configuration={JSON.stringify(configuration)} />);
    await user.click(screen.getByText('Submit'));
    expect(screen.getByText('embedding_dimension must be a number')).toBeInTheDocument();
  });

  it('should display error if framework_type is invalid', async () => {
    const configuration = {
      model_type: 'roberta',
      embedding_dimension: 768,
      framework_type: 0,
    };
    const user = userEvent.setup();
    render(<TestApp configuration={JSON.stringify(configuration)} />);
    await user.click(screen.getByText('Submit'));
    expect(screen.getByText('framework_type must be a string')).toBeInTheDocument();
  });
});
