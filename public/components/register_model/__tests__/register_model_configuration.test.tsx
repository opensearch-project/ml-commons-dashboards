/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { screen, within } from '../../../../test/test_utils';
import { setup } from './setup';
import * as formAPI from '../register_model_api';
import { ModelFileUploadManager } from '../model_file_upload_manager';

describe('<RegisterModel /> Configuration', () => {
  const onSubmitWithFileMock = jest.fn().mockResolvedValue('model_id');
  const onSubmitWithURLMock = jest.fn();
  const uploadMock = jest.fn();

  beforeEach(() => {
    jest.spyOn(formAPI, 'submitModelWithFile').mockImplementation(onSubmitWithFileMock);
    jest.spyOn(formAPI, 'submitModelWithURL').mockImplementation(onSubmitWithURLMock);
    jest.spyOn(ModelFileUploadManager.prototype, 'upload').mockImplementation(uploadMock);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should not allow to submit form if model_type is missing', async () => {
    // Missing model_type
    const invalidConfiguration = `{}`;
    const result = await setup({ defaultValues: { configuration: invalidConfiguration } });
    await result.user.click(result.submitButton);
    expect(onSubmitWithFileMock).not.toHaveBeenCalled();

    // Field error messages
    const configurationContainer = screen.getByTestId('ml-registerModelConfiguration');
    expect(
      within(configurationContainer).queryByText(/model_type is required/i)
    ).toBeInTheDocument();

    // Error Callout
    const errorCallOutContainer = screen.getByLabelText(/Address errors in the form/i);
    expect(
      within(errorCallOutContainer).queryByText(/JSON configuration: specify the model_type/i)
    ).toBeInTheDocument();
  });

  it('should not allow to submit form if model_type is invalid', async () => {
    // Incorrect model_type type, model_type must be a string
    const invalidConfiguration = `{
      "model_type": false
    }`;
    const result = await setup({ defaultValues: { configuration: invalidConfiguration } });
    await result.user.click(result.submitButton);
    expect(onSubmitWithFileMock).not.toHaveBeenCalled();

    // Field error messages
    const configurationContainer = screen.getByTestId('ml-registerModelConfiguration');
    expect(
      within(configurationContainer).queryByText(/model_type must be a string/i)
    ).toBeInTheDocument();

    // Error Callout
    const errorCallOutContainer = screen.getByLabelText(/Address errors in the form/i);
    expect(
      within(errorCallOutContainer).queryByText(/JSON configuration: model_type must be a string./i)
    ).toBeInTheDocument();
  });

  it('should not allow to submit form if embedding_dimension is invalid', async () => {
    // Incorrect embedding_dimension type, embedding_dimension must be a number
    const invalidConfiguration = `{
      "model_type": "bert",
      "embedding_dimension": "must_be_a_number"
    }`;
    const result = await setup({ defaultValues: { configuration: invalidConfiguration } });
    await result.user.click(result.submitButton);
    expect(onSubmitWithFileMock).not.toHaveBeenCalled();

    // Field error messages
    const configurationContainer = screen.getByTestId('ml-registerModelConfiguration');
    expect(
      within(configurationContainer).queryByText(/embedding_dimension must be a number/i)
    ).toBeInTheDocument();

    // Error Callout
    const errorCallOutContainer = screen.getByLabelText(/Address errors in the form/i);
    expect(
      within(errorCallOutContainer).queryByText(
        /JSON configuration: embedding_dimension must be a number/i
      )
    ).toBeInTheDocument();
  });

  it('should not allow to submit form if framework_type is invalid', async () => {
    // Incorrect framework_type, framework_type must be a string
    const invalidConfiguration = `{
      "model_type": "bert",
      "framework_type": 384
    }`;
    const result = await setup({ defaultValues: { configuration: invalidConfiguration } });
    await result.user.click(result.submitButton);
    expect(onSubmitWithFileMock).not.toHaveBeenCalled();

    // Field error messages
    const configurationContainer = screen.getByTestId('ml-registerModelConfiguration');
    expect(
      within(configurationContainer).queryByText(/framework_type must be a string/i)
    ).toBeInTheDocument();

    // Error Callout
    const errorCallOutContainer = screen.getByLabelText(/Address errors in the form/i);
    expect(
      within(errorCallOutContainer).queryByText(
        /JSON configuration: framework_type must be a string./i
      )
    ).toBeInTheDocument();
  });
});
