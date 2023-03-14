/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { screen } from '../../../../test/test_utils';
import { setup } from './setup';
import * as formHooks from '../register_model.hooks';
import * as formAPI from '../register_model_api';
import { ModelFileUploadManager } from '../model_file_upload_manager';

describe('<RegisterModel /> ErrorCallOut', () => {
  const onSubmitWithFileMock = jest.fn().mockResolvedValue('model_id');
  const onSubmitWithURLMock = jest.fn();
  const uploadMock = jest.fn();

  beforeEach(() => {
    jest
      .spyOn(formHooks, 'useMetricNames')
      .mockReturnValue([false, ['Metric 1', 'Metric 2', 'Metric 3', 'Metric 4']]);
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

  it('should display error call-out', async () => {
    const { user, nameInput } = await setup();
    await user.clear(nameInput);
    await user.click(screen.getByRole('button', { name: /register model/i }));

    expect(screen.queryByLabelText(/Address errors in the form/i)).toBeInTheDocument();
  });

  it('should not display error call-out after errors been fixed', async () => {
    const { user, nameInput } = await setup();
    await user.clear(nameInput);
    await user.click(screen.getByRole('button', { name: /register model/i }));

    expect(screen.queryByLabelText(/Address errors in the form/i)).toBeInTheDocument();

    // fix the form errors
    await user.type(nameInput, 'test model name');
    expect(screen.queryByLabelText(/Address errors in the form/i)).not.toBeInTheDocument();
  });
});
