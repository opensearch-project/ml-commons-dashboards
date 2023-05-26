/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { setup } from './setup';
import * as formAPI from '../register_model_api';

describe('<RegisterModel /> Details', () => {
  const onSubmitMock = jest.fn().mockResolvedValue('model_id');

  beforeEach(() => {
    jest.spyOn(formAPI, 'submitModelWithFile').mockImplementation(onSubmitMock);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render a model details panel', async () => {
    const result = await setup();
    expect(result.nameInput).toBeInTheDocument();
    expect(result.descriptionInput).toBeInTheDocument();
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

  it('should NOT allow to input a model name which exceed max length: 80', async () => {
    const result = await setup();

    await result.user.clear(result.nameInput);
    await result.user.type(result.nameInput, 'x'.repeat(81));
    expect(result.nameInput.value).toHaveLength(80);
  });

  it('should NOT submit the register model form if model name is duplicated', async () => {
    const result = await setup();

    await result.user.clear(result.nameInput);
    await result.user.type(result.nameInput, 'model1');
    await result.user.click(result.submitButton);

    expect(result.nameInput).toBeInvalid();
    expect(onSubmitMock).not.toHaveBeenCalled();
  });

  it('should submit the register model form if model description is empty', async () => {
    const result = await setup();

    await result.user.clear(result.descriptionInput);
    await result.user.click(result.submitButton);

    expect(onSubmitMock).toHaveBeenCalled();
  });

  it('should NOT allow to input a model description which exceed max length: 200', async () => {
    const result = await setup();

    await result.user.clear(result.descriptionInput);
    await result.user.type(result.descriptionInput, 'x'.repeat(201));
    expect(result.descriptionInput.value).toHaveLength(200);
  });
});
