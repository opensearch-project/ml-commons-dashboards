/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { screen } from '../../../../test/test_utils';
import { setup } from './setup';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({
    id: '',
  }),
}));

describe('<RegisterModel /> Artifact', () => {
  it('should render an artifact panel', async () => {
    const onSubmitMock = jest.fn();
    const result = await setup({ onSubmit: onSubmitMock });
    expect(result.modelFileInput).toBeInTheDocument();
    expect(screen.getByLabelText(/from computer/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/from url/i)).toBeInTheDocument();
  });

  it('should submit the register model form', async () => {
    const onSubmitMock = jest.fn();
    const result = await setup({ onSubmit: onSubmitMock });
    expect(onSubmitMock).not.toHaveBeenCalled();

    await result.user.click(result.submitButton);

    expect(onSubmitMock).toHaveBeenCalled();
  });

  it('should NOT submit the register model form if model file is empty', async () => {
    const onSubmitMock = jest.fn();
    const result = await setup({ onSubmit: onSubmitMock });

    // Empty model file selection by clicking the `Remove` button on EuiFilePicker
    await result.user.click(screen.getByLabelText(/clear selected files/i));
    await result.user.click(result.submitButton);

    expect(result.modelFileInput).toBeInvalid();
    expect(onSubmitMock).not.toHaveBeenCalled();
  });

  it('should NOT submit the register model form if model url is empty', async () => {
    const onSubmitMock = jest.fn();
    const result = await setup({ onSubmit: onSubmitMock });

    // select option: From URL
    await result.user.click(screen.getByLabelText(/from url/i));

    const urlInput = screen.getByLabelText<HTMLInputElement>(/model url/i);

    // Empty URL input
    await result.user.clear(urlInput);
    await result.user.click(result.submitButton);

    expect(urlInput).toBeInvalid();
    expect(onSubmitMock).not.toHaveBeenCalled();
  });
});
