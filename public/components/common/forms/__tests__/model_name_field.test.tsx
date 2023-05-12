/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useForm } from 'react-hook-form';
import userEvent from '@testing-library/user-event';

import { render, screen } from '../../../../../test/test_utils';

import { ModelNameField } from '../model_name_field';

const setup = ({
  name = '',
  readOnly = false,
  originalModelName,
}: { name?: string; readOnly?: boolean; originalModelName?: string } = {}) => {
  const NameForm = () => {
    const { control, trigger } = useForm({
      mode: 'onChange',
      defaultValues: {
        name,
      },
    });
    return (
      <ModelNameField
        control={control}
        trigger={trigger}
        readOnly={readOnly}
        originalModelName={originalModelName}
      />
    );
  };

  render(<NameForm />);

  const input = screen.getByLabelText<HTMLInputElement>(/name/i);

  return {
    input,
    getHelpTextNode: () => input.closest('.euiFormRow')?.querySelector('.euiFormHelpText'),
    getErrorMessageNode: () => input.closest('.euiFormRow')?.querySelector('.euiFormErrorText'),
  };
};

describe('<ModelNameField />', () => {
  it('should render "Name" title, content and "80 characters allowed" by default', () => {
    const { input, getHelpTextNode } = setup();
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(input).toHaveValue('');
    expect(getHelpTextNode()).toHaveTextContent('80 characters allowed');
  });

  it('should show 80 characters and "0 characters left" after 81 characters input', async () => {
    const { input, getHelpTextNode } = setup();

    await userEvent.type(input, 'x'.repeat(81));
    expect(input.value).toHaveLength(80);
    expect(getHelpTextNode()).toHaveTextContent('0 characters left');
  });

  it('should show "Name can not be empty" error message after name be cleared', async () => {
    const { input, getErrorMessageNode } = setup({ name: '12345' });

    await userEvent.clear(input);

    expect(getErrorMessageNode()).toHaveTextContent('Name can not be empty');
  });

  it('should show "This name is already in use. Use a unique name for the model." after name duplicated', async () => {
    const { input, getErrorMessageNode } = setup({ name: '12345' });

    await userEvent.clear(input);
    await userEvent.type(input, 'model1');
    // mock user blur
    await userEvent.click(screen.getByText('Name'));

    expect(getErrorMessageNode()).toHaveTextContent(
      'This name is already in use. Use a unique name for the model.'
    );
  });

  it('should NOT show name duplicate error if changed name equal original name', async () => {
    const { input, getErrorMessageNode } = setup({ name: 'model1', originalModelName: 'model1' });

    await userEvent.clear(input);
    await userEvent.type(input, 'model1');
    // mock user blur
    await userEvent.click(screen.getByText('Name'));

    expect(getErrorMessageNode()).not.toBeInTheDocument();
  });

  it('should set input to readOnly and hide help text', async () => {
    const { input, getHelpTextNode } = setup({ name: 'foo', readOnly: true });

    expect(input).toHaveAttribute('readonly');
    expect(getHelpTextNode()).not.toBeInTheDocument();
  });
});
