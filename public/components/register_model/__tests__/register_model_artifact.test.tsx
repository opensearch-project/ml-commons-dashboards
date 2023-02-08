/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { screen } from '../../../../test/test_utils';
import { setup } from './setup';

describe('<RegisterModel /> Artifact', () => {
  it('should render an artifact panel', async () => {
    const onSubmitMock = jest.fn();
    await setup({ onSubmit: onSubmitMock });
    expect(screen.getByLabelText(/file/i, { selector: 'input[type="file"]' })).toBeInTheDocument();
    expect(screen.getByLabelText(/from computer/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/from url/i)).toBeInTheDocument();
  });

  it('should not render an artifact panel if importing an opensearch defined model', async () => {
    const onSubmitMock = jest.fn();
    await setup({ onSubmit: onSubmitMock }, { route: '/?type=import' });
    expect(screen.queryByLabelText(/file/i, { selector: 'input[type="file"]' })).toBeNull();
  });

  it('should submit the register model form', async () => {
    const onSubmitMock = jest.fn();
    const result = await setup({ onSubmit: onSubmitMock });
    expect(onSubmitMock).not.toHaveBeenCalled();

    await result.user.click(result.submitButton);

    expect(onSubmitMock).toHaveBeenCalled();
  });

  it('should NOT submit the register model form if model file size exceed 80MB', async () => {
    const onSubmitMock = jest.fn();
    const result = await setup({ onSubmit: onSubmitMock });

    // Empty model file selection by clicking the `Remove` button on EuiFilePicker
    await result.user.click(screen.getByLabelText(/clear selected files/i));
    await result.user.click(result.submitButton);

    const modelFileInput = screen.getByLabelText<HTMLInputElement>(/file/i);
    // File size can not exceed 80MB
    const invalidFile = new File(['test model file'], 'model.zip', { type: 'application/zip' });
    Object.defineProperty(invalidFile, 'size', { value: 81 * 1000 * 1000 });
    await result.user.upload(modelFileInput, invalidFile);

    expect(screen.getByLabelText(/file/i, { selector: 'input[type="file"]' })).toBeInvalid();
    expect(onSubmitMock).not.toHaveBeenCalled();
  });

  it('should NOT submit the register model form if model file is empty', async () => {
    const onSubmitMock = jest.fn();
    const result = await setup({ onSubmit: onSubmitMock });

    // Empty model file selection by clicking the `Remove` button on EuiFilePicker
    await result.user.click(screen.getByLabelText(/clear selected files/i));
    await result.user.click(result.submitButton);

    expect(screen.getByLabelText(/file/i, { selector: 'input[type="file"]' })).toBeInvalid();
    expect(onSubmitMock).not.toHaveBeenCalled();
  });

  it('should NOT submit the register model form if model url is empty', async () => {
    const onSubmitMock = jest.fn();
    const result = await setup({ onSubmit: onSubmitMock });

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
