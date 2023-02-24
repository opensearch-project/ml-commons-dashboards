/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { screen } from '../../../../test/test_utils';
import { setup } from './setup';
import * as formHooks from '../register_model.hooks';
import { ModelFileUploadManager } from '../model_file_upload_manager';
import { ONE_GB } from '../../../../common/constant';

describe('<RegisterModel /> Artifact', () => {
  const onSubmitMock = jest.fn();
  const uploadMock = jest.fn();

  beforeEach(() => {
    jest
      .spyOn(formHooks, 'useMetricNames')
      .mockReturnValue([false, ['Metric 1', 'Metric 2', 'Metric 3', 'Metric 4']]);
    jest
      .spyOn(formHooks, 'useModelTags')
      .mockReturnValue([false, { keys: ['Key1', 'Key2'], values: ['Value1', 'Value2'] }]);
    jest.spyOn(formHooks, 'useModelUpload').mockReturnValue(onSubmitMock);
    jest.spyOn(ModelFileUploadManager.prototype, 'upload').mockImplementation(uploadMock);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render an artifact panel', async () => {
    await setup();
    expect(screen.getByLabelText(/file/i, { selector: 'input[type="file"]' })).toBeInTheDocument();
    expect(screen.getByLabelText(/from computer/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/from url/i)).toBeInTheDocument();
  });

  it('should not render an artifact panel if importing an opensearch defined model', async () => {
    await setup({ route: '/?type=import' });
    expect(screen.queryByLabelText(/file/i, { selector: 'input[type="file"]' })).toBeNull();
  });

  it('should submit the register model form', async () => {
    const result = await setup();
    expect(onSubmitMock).not.toHaveBeenCalled();

    await result.user.click(result.submitButton);
    expect(onSubmitMock).toHaveBeenCalled();
  });

  it('should upload the model file', async () => {
    const result = await setup();
    await result.user.click(result.submitButton);
    expect(onSubmitMock).toHaveBeenCalled();
    expect(uploadMock).toHaveBeenCalled();
  });

  it('should submit the register model form if model file size is 4GB', async () => {
    const result = await setup();

    // Empty model file selection by clicking the `Remove` button on EuiFilePicker
    await result.user.click(screen.getByLabelText(/clear selected files/i));

    const modelFileInput = screen.getByLabelText<HTMLInputElement>(/file/i);
    // User select a file with maximum accepted size
    const validFile = new File(['test model file'], 'model.zip', { type: 'application/zip' });
    Object.defineProperty(validFile, 'size', { value: 4 * ONE_GB });
    await result.user.upload(modelFileInput, validFile);

    expect(screen.getByLabelText(/file/i, { selector: 'input[type="file"]' })).toBeValid();
    await result.user.click(result.submitButton);
    expect(onSubmitMock).toHaveBeenCalled();
  });

  it('should NOT submit the register model form if model file size exceed 4GB', async () => {
    const result = await setup();

    // Empty model file selection by clicking the `Remove` button on EuiFilePicker
    await result.user.click(screen.getByLabelText(/clear selected files/i));

    const modelFileInput = screen.getByLabelText<HTMLInputElement>(/file/i);
    // File size can not exceed 4GB
    const invalidFile = new File(['test model file'], 'model.zip', { type: 'application/zip' });
    Object.defineProperty(invalidFile, 'size', { value: 4 * ONE_GB + 1 });
    await result.user.upload(modelFileInput, invalidFile);

    expect(screen.getByLabelText(/file/i, { selector: 'input[type="file"]' })).toBeInvalid();
    await result.user.click(result.submitButton);
    expect(onSubmitMock).not.toHaveBeenCalled();
  });

  it('should NOT submit the register model form if model file is not ZIP', async () => {
    const result = await setup();

    // Empty model file selection by clicking the `Remove` button on EuiFilePicker
    await result.user.click(screen.getByLabelText(/clear selected files/i));

    const modelFileInput = screen.getByLabelText<HTMLInputElement>(/file/i);
    // Only ZIP(.zip) file is allowed
    const invalidFile = new File(['test model file'], 'model.json', { type: 'application/json' });
    await result.user.upload(modelFileInput, invalidFile);

    expect(screen.getByLabelText(/file/i, { selector: 'input[type="file"]' })).toBeInvalid();
    await result.user.click(result.submitButton);
    expect(onSubmitMock).not.toHaveBeenCalled();
  });

  it('should NOT submit the register model form if model file is empty', async () => {
    const result = await setup();

    // Empty model file selection by clicking the `Remove` button on EuiFilePicker
    await result.user.click(screen.getByLabelText(/clear selected files/i));
    await result.user.click(result.submitButton);

    expect(screen.getByLabelText(/file/i, { selector: 'input[type="file"]' })).toBeInvalid();
    expect(onSubmitMock).not.toHaveBeenCalled();
  });

  it('should NOT submit the register model form if model url is empty', async () => {
    const result = await setup();

    // select option: From URL
    await result.user.click(screen.getByLabelText(/from url/i));

    const urlInput = screen.getByLabelText<HTMLInputElement>(/url/i, {
      selector: 'input[type="text"]',
    });

    // Empty URL input
    await result.user.clear(urlInput);
    await result.user.click(result.submitButton);

    expect(urlInput).toBeInvalid();
    expect(onSubmitMock).not.toHaveBeenCalled();
  });
});
