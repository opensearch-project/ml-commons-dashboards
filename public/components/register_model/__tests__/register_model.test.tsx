import React from 'react';

import { RegisterModelForm } from '../register_model';
import { render, screen, fireEvent, waitFor } from '../../../../test/test_utils';

describe('<RegisterModel />', () => {
  const onSubmitMock = jest.fn();

  function setup() {
    render(<RegisterModelForm onSubmit={onSubmitMock} />);
    const nameInput = screen.getByLabelText<HTMLInputElement>(/model name/i);
    const versionInput = screen.getByLabelText<HTMLInputElement>(/version/i);
    const descriptionInput = screen.getByLabelText<HTMLTextAreaElement>(/model description/i);
    const annotationsInput = screen.getByLabelText<HTMLTextAreaElement>(/annotations\(optional\)/i);
    const submitButton = screen.getByRole<HTMLButtonElement>('button', {
      name: /register model/i,
    });
    const form = screen.getByTestId('mlCommonsPlugin-registerModelForm');

    return {
      nameInput,
      versionInput,
      descriptionInput,
      annotationsInput,
      submitButton,
      form,
    };
  }

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should render a model details panel', () => {
    const result = setup();
    expect(result.nameInput).toBeInTheDocument();
    // Model version is not editable
    expect(result.versionInput).toBeDisabled();
    // Model Version should alway have a value
    expect(result.versionInput.value).not.toBe('');
    expect(result.descriptionInput).toBeInTheDocument();
    expect(result.annotationsInput).toBeInTheDocument();
  });

  it('should submit the register model form', async () => {
    const result = setup();
    expect(onSubmitMock).not.toHaveBeenCalled();

    // fill model name
    fireEvent.input(result.nameInput, { target: { value: 'test model name' } });
    // fill model description
    fireEvent.input(result.descriptionInput, { target: { value: 'test model description' } });

    fireEvent.submit(result.submitButton);

    await waitFor(() => expect(onSubmitMock).toHaveBeenCalled());
  });

  it('should NOT submit the register model form', async () => {
    const result = setup();
    expect(onSubmitMock).not.toHaveBeenCalled();

    fireEvent.submit(result.submitButton);

    await waitFor(() => {
      // The name and description are required
      expect(result.nameInput).toBeInvalid();
      expect(result.descriptionInput).toBeInvalid();
    });
    expect(onSubmitMock).not.toHaveBeenCalled();
  });
});
