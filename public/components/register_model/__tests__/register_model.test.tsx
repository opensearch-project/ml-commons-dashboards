import React from 'react';
import userEvent from '@testing-library/user-event';

import { RegisterModelForm } from '../register_model';
import { render, screen } from '../../../../test/test_utils';

describe('<RegisterModel />', () => {
  const onSubmitMock = jest.fn();

  async function setup() {
    render(<RegisterModelForm onSubmit={onSubmitMock} />);
    const nameInput = screen.getByLabelText<HTMLInputElement>(/model name/i);
    const versionInput = screen.getByLabelText<HTMLInputElement>(/version/i);
    const descriptionInput = screen.getByLabelText<HTMLTextAreaElement>(/model description/i);
    const annotationsInput = screen.getByLabelText<HTMLTextAreaElement>(/annotations\(optional\)/i);
    const submitButton = screen.getByRole<HTMLButtonElement>('button', {
      name: /register model/i,
    });
    const modelFileInput = screen.getByLabelText<HTMLInputElement>(/model file/i);
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
      submitButton,
      modelFileInput,
      form,
      user,
    };
  }

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should render a model details panel', async () => {
    const result = await setup();
    expect(result.nameInput).toBeInTheDocument();
    // Model version is not editable
    expect(result.versionInput).toBeDisabled();
    // Model Version should alway have a value
    expect(result.versionInput.value).not.toBe('');
    expect(result.descriptionInput).toBeInTheDocument();
    expect(result.annotationsInput).toBeInTheDocument();
  });

  it('should submit the register model form', async () => {
    const result = await setup();
    expect(onSubmitMock).not.toHaveBeenCalled();

    await result.user.click(result.submitButton);

    expect(onSubmitMock).toHaveBeenCalled();
  });

  it('should NOT submit the register model form if model name is empty', async () => {
    const result = await setup();

    await result.user.clear(result.nameInput);
    await result.user.click(result.submitButton);

    expect(result.nameInput).toBeInvalid();
    expect(onSubmitMock).not.toHaveBeenCalled();
  });

  it('should NOT submit the register model form if model description is empty', async () => {
    const result = await setup();

    await result.user.clear(result.descriptionInput);
    await result.user.click(result.submitButton);

    expect(result.descriptionInput).toBeInvalid();
    expect(onSubmitMock).not.toHaveBeenCalled();
  });

  it('should NOT submit the register model form if model file is empty', async () => {
    const result = await setup();

    // Empty model file selection by clicking the `Remove` button on EuiFilePicker
    await result.user.click(screen.getByText(/remove/i));
    await result.user.click(result.submitButton);

    expect(result.modelFileInput).toBeInvalid();
    expect(onSubmitMock).not.toHaveBeenCalled();
  });

  it('should NOT submit the register model form if model url is empty', async () => {
    const result = await setup();

    // select option: From URL
    await result.user.click(screen.getByLabelText(/from url/i));

    const urlInput = screen.getByLabelText<HTMLInputElement>(/model url/i);

    // Empty URL input
    await result.user.clear(urlInput);
    await result.user.click(result.submitButton);

    expect(urlInput).toBeInvalid();
    expect(onSubmitMock).not.toHaveBeenCalled();
  });
});
