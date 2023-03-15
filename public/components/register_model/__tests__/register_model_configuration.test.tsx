/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { screen, within } from '../../../../test/test_utils';
import { setup } from './setup';
import * as formAPI from '../register_model_api';
import * as formHooks from '../register_model.hooks';
import { ModelFileUploadManager } from '../model_file_upload_manager';

describe('<RegisterModel /> Configuration', () => {
  const onSubmitWithFileMock = jest.fn().mockResolvedValue('model_id');
  const onSubmitWithURLMock = jest.fn();
  const uploadMock = jest.fn();

  beforeEach(() => {
    jest
      .spyOn(formHooks, 'useModelTags')
      .mockReturnValue([false, { keys: ['Key1', 'Key2'], values: ['Value1', 'Value2'] }]);
    jest.spyOn(formAPI, 'submitModelWithFile').mockImplementation(onSubmitWithFileMock);
    jest.spyOn(formAPI, 'submitModelWithURL').mockImplementation(onSubmitWithURLMock);
    jest.spyOn(ModelFileUploadManager.prototype, 'upload').mockImplementation(uploadMock);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render a help flyout when click help button', async () => {
    const { user } = await setup();

    expect(screen.getByLabelText('Configuration in JSON')).toBeInTheDocument();
    await user.click(screen.getByTestId('model-configuration-help-button'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('should not allow to submit form if configuration object is invalid', async () => {
    const invalidConfiguration = `{
      "embedding_dimension": "must_be_a_number",
      "framework_type": 384
    }`;
    const result = await setup({ defaultValues: { configuration: invalidConfiguration } });
    await result.user.click(result.submitButton);
    expect(onSubmitWithFileMock).not.toHaveBeenCalled();

    // Field error messages
    const configurationContainer = screen.getByTestId('ml-registerModelConfiguration');
    expect(
      within(configurationContainer).queryByText(/embedding_dimension must be a number/i)
    ).toBeInTheDocument();
    expect(
      within(configurationContainer).queryByText(/framework_type must be a string/i)
    ).toBeInTheDocument();
    expect(
      within(configurationContainer).queryByText(/model_type is required/i)
    ).toBeInTheDocument();

    // Error Callout
    const errorCallOutContainer = screen.getByLabelText(/Address errors in the form/i);
    expect(
      within(errorCallOutContainer).queryByText(/JSON configuration: specify the model_type/i)
    ).toBeInTheDocument();
    expect(
      within(errorCallOutContainer).queryByText(
        /JSON configuration: embedding_dimension must be a number/i
      )
    ).toBeInTheDocument();
    expect(
      within(errorCallOutContainer).queryByText(
        /JSON configuration: framework_type must be a string./i
      )
    ).toBeInTheDocument();
  });
});
