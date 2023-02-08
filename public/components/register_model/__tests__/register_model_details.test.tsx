/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { setup } from './setup';

describe('<RegisterModel /> Details', () => {
  it('should render a model details panel', async () => {
    const onSubmitMock = jest.fn();
    const result = await setup({ onSubmit: onSubmitMock });
    expect(result.nameInput).toBeInTheDocument();
    expect(result.descriptionInput).toBeInTheDocument();
    expect(result.annotationsInput).toBeInTheDocument();
  });

  it('should submit the register model form', async () => {
    const onSubmitMock = jest.fn();
    const result = await setup({ onSubmit: onSubmitMock });
    expect(onSubmitMock).not.toHaveBeenCalled();

    await result.user.click(result.submitButton);

    expect(onSubmitMock).toHaveBeenCalled();
  });

  it('should NOT submit the register model form if model name is empty', async () => {
    const onSubmitMock = jest.fn();
    const result = await setup({ onSubmit: onSubmitMock });

    await result.user.clear(result.nameInput);
    await result.user.click(result.submitButton);

    expect(result.nameInput).toBeInvalid();
    expect(onSubmitMock).not.toHaveBeenCalled();
  });

  it('should NOT submit the register model form if model name length exceeded 60', async () => {
    const onSubmitMock = jest.fn();
    const result = await setup({ onSubmit: onSubmitMock });

    await result.user.clear(result.nameInput);
    await result.user.type(result.nameInput, 'x'.repeat(60));
    expect(result.nameInput).toBeValid();

    await result.user.clear(result.nameInput);
    await result.user.type(result.nameInput, 'x'.repeat(61));
    expect(result.nameInput).toBeInvalid();

    await result.user.click(result.submitButton);
    expect(onSubmitMock).not.toHaveBeenCalled();
  });

  it('should NOT submit the register model form if model description is empty', async () => {
    const onSubmitMock = jest.fn();
    const result = await setup({ onSubmit: onSubmitMock });

    await result.user.clear(result.descriptionInput);
    await result.user.click(result.submitButton);

    expect(result.descriptionInput).toBeInvalid();
    expect(onSubmitMock).not.toHaveBeenCalled();
  });

  it('should NOT submit the register model form if model description length exceed 200', async () => {
    const onSubmitMock = jest.fn();
    const result = await setup({ onSubmit: onSubmitMock });

    await result.user.clear(result.descriptionInput);
    await result.user.type(result.descriptionInput, 'x'.repeat(200));
    expect(result.descriptionInput).toBeValid();

    await result.user.clear(result.descriptionInput);
    await result.user.type(result.descriptionInput, 'x'.repeat(201));
    expect(result.descriptionInput).toBeInvalid();

    await result.user.click(result.submitButton);
    expect(onSubmitMock).not.toHaveBeenCalled();
  });

  it('annotation text length should not exceed 200', async () => {
    const onSubmitMock = jest.fn();
    const result = await setup({ onSubmit: onSubmitMock });

    await result.user.clear(result.annotationsInput);
    await result.user.type(result.annotationsInput, 'x'.repeat(200));
    expect(result.annotationsInput).toBeValid();

    await result.user.clear(result.annotationsInput);
    await result.user.type(result.annotationsInput, 'x'.repeat(201));
    expect(result.annotationsInput).toBeInvalid();

    await result.user.click(result.submitButton);
    expect(onSubmitMock).not.toHaveBeenCalled();
  });
});
