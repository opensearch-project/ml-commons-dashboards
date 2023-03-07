/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { setup } from './setup';
import * as formHooks from '../register_model.hooks';
import * as formAPI from '../register_model_api';
import { Model } from '../../../apis/model';

describe('<RegisterModel /> Details', () => {
  const onSubmitMock = jest.fn();

  beforeEach(() => {
    jest
      .spyOn(formHooks, 'useMetricNames')
      .mockReturnValue([false, ['Metric 1', 'Metric 2', 'Metric 3', 'Metric 4']]);
    jest
      .spyOn(formHooks, 'useModelTags')
      .mockReturnValue([false, { keys: ['Key1', 'Key2'], values: ['Value1', 'Value2'] }]);
    jest.spyOn(formAPI, 'submitModelWithFile').mockImplementation(onSubmitMock);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render a model details panel', async () => {
    const result = await setup();
    expect(result.nameInput).toBeInTheDocument();
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

  it('should NOT submit the register model form if model name length exceeded 80', async () => {
    const result = await setup();

    await result.user.clear(result.nameInput);
    await result.user.type(result.nameInput, 'x'.repeat(80));
    expect(result.nameInput).toBeValid();

    await result.user.clear(result.nameInput);
    await result.user.type(result.nameInput, 'x'.repeat(81));
    expect(result.nameInput).toBeInvalid();

    await result.user.click(result.submitButton);
    expect(onSubmitMock).not.toHaveBeenCalled();
  });

  it('should NOT submit the register model form if model name is duplicated', async () => {
    const result = await setup();
    jest.spyOn(Model.prototype, 'search').mockResolvedValue({
      data: [],
      pagination: { totalPages: 1, totalRecords: 1, currentPage: 1, pageSize: 1 },
    });

    await result.user.clear(result.nameInput);
    await result.user.type(result.nameInput, 'a-duplicated-model-name');
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

  it('should NOT submit the register model form if model description length exceed 200', async () => {
    const result = await setup();

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
    const result = await setup();

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
