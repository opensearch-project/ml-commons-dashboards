/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import userEvent from '@testing-library/user-event';

import { render, screen, within } from '../../../../../test/test_utils';
import { ModelFileFormatSelect } from '../model_file_format';

const TestApp = ({
  readOnly = false,
  onSubmit = jest.fn(),
  onError = jest.fn(),
}: {
  readOnly?: boolean;
  onSubmit?: () => any;
  onError?: () => any;
}) => {
  const form = useForm({
    defaultValues: {
      modelFileFormat: 'TORCH_SCRIPT',
    },
  });

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit, onError)}>
        <ModelFileFormatSelect readOnly={readOnly} />
        <button type="submit">Submit</button>
      </form>
    </FormProvider>
  );
};

describe('<ModelFileFormatSelect />', () => {
  it('should render a model file format select', async () => {
    const user = userEvent.setup();
    render(<TestApp />);

    const input = screen.getByLabelText<HTMLInputElement>(/model file format/i);
    await user.click(input);

    const listBox = screen.getByRole('listBox');

    expect(within(listBox).getByText('Torchscript(.pt)')).toBeInTheDocument();
    expect(within(listBox).getByText('ONNX(.onnx)')).toBeInTheDocument();
  });

  it('should select model file format from the dropdown list', async () => {
    const user = userEvent.setup();
    render(<TestApp />);

    const comboBox = screen.getByRole('combobox');
    // the default value
    expect(within(comboBox).getByText('Torchscript(.pt)')).toBeInTheDocument();

    const input = screen.getByLabelText<HTMLInputElement>(/model file format/i);
    await user.click(input);

    const listBox = screen.getByRole('listBox');
    // select another value
    await user.click(within(listBox).getByText('ONNX(.onnx)'));
    expect(within(comboBox).getByText('ONNX(.onnx)')).toBeInTheDocument();
  });

  it('should display model file format input as readonly', () => {
    render(<TestApp readOnly />);
    const input = screen.getByLabelText<HTMLInputElement>(/model file format/i);
    expect(input).toHaveAttribute('readonly');
    // render default value in a readonly input
    expect(screen.getByDisplayValue('Torchscript(.pt)')).toBeInTheDocument();
  });

  it('should display error message if model file format select is empty', async () => {
    const user = userEvent.setup();
    render(<TestApp />);

    // clear default value
    await user.click(screen.getByLabelText('Clear input'));
    await user.click(screen.getByText('Submit'));

    expect(
      screen.getByText('Model file format is required. Select a model file format.')
    ).toBeInTheDocument();
  });
});
