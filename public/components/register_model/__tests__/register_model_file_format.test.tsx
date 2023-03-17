/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { screen } from '../../../../test/test_utils';
import { setup } from './setup';
import * as formHooks from '../register_model.hooks';
import { ModelFileUploadManager } from '../model_file_upload_manager';
import * as formAPI from '../register_model_api';

jest.mock('../../../apis/model_repository');

describe('<RegisterModel /> Artifact', () => {
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

  it('should not submit the form if model format is not selected', async () => {
    const result = await setup();
    result.user.click(screen.getByLabelText('Clear input'));

    await result.user.click(result.submitButton);
    expect(onSubmitWithFileMock).not.toHaveBeenCalled();
  });

  it('should display error messages if model format is not selected', async () => {
    const result = await setup();
    result.user.click(screen.getByLabelText('Clear input'));

    await result.user.click(result.submitButton);
    expect(onSubmitWithFileMock).not.toHaveBeenCalled();

    // Field error message
    expect(
      screen.queryByText(/Model file format is required. Select a model file format/i)
    ).toBeInTheDocument();

    // Error callout
    expect(screen.queryByText(/Model file format: Select a model format/i)).toBeInTheDocument();
  });

  it('should submit the form with selected model file format', async () => {
    const result = await setup();
    const fileFormatInput = screen.getByLabelText(/^Model file format$/i);
    await result.user.click(fileFormatInput);
    await result.user.click(screen.getByText('Torchscript(.pt)'));

    await result.user.click(result.submitButton);
    expect(onSubmitWithFileMock).toHaveBeenCalledWith(
      expect.objectContaining({ modelFileFormat: 'TORCH_SCRIPT' })
    );
  });
});
