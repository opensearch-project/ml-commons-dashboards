/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import userEvent from '@testing-library/user-event';

import { ModelFileUploader } from '../artifact_file';
import { render, screen } from '../../../../../test/test_utils';
import { ONE_GB } from '../../../../../common/constant';

const TestApp = ({ readOnly = false }: { readOnly?: boolean }) => {
  const form = useForm({
    defaultValues: {},
    mode: 'onChange',
  });

  return (
    <FormProvider {...form}>
      <ModelFileUploader label="File" readOnly={readOnly} />
    </FormProvider>
  );
};

describe('<ModelFileUploader />', () => {
  it('should render a file upload input field', () => {
    render(<TestApp />);
    expect(screen.getByLabelText(/file/i, { selector: 'input[type="file"]' })).toBeInTheDocument();
  });

  it('should display error if selected file size > 4GB', async () => {
    const user = userEvent.setup();
    render(<TestApp />);
    const modelFileInput = screen.getByLabelText<HTMLInputElement>(/^file$/i);
    // File size can not exceed 4GB
    const invalidFile = new File(['test model file'], 'model.zip', { type: 'application/zip' });
    Object.defineProperty(invalidFile, 'size', { value: 4 * ONE_GB + 1 });
    await user.upload(modelFileInput, invalidFile);

    expect(screen.getByLabelText(/file/i, { selector: 'input[type="file"]' })).toBeInvalid();
    expect(screen.getByText('Maximum file size exceeded. Add a smaller file.')).toBeInTheDocument();
  });

  it('should allow to upload file <= 4GB', async () => {
    const user = userEvent.setup();
    render(<TestApp />);
    const modelFileInput = screen.getByLabelText<HTMLInputElement>(/^file$/i);
    // File size can not exceed 4GB
    const invalidFile = new File(['test model file'], 'model.zip', { type: 'application/zip' });
    Object.defineProperty(invalidFile, 'size', { value: 4 * ONE_GB });
    await user.upload(modelFileInput, invalidFile);

    expect(screen.getByLabelText(/file/i, { selector: 'input[type="file"]' })).toBeValid();
    expect(
      screen.queryByText('Maximum file size exceeded. Add a smaller file.')
    ).not.toBeInTheDocument();
  });

  it('should display a readonly file uploader', () => {
    render(<TestApp readOnly />);
    const modelFileInput = screen.getByLabelText<HTMLInputElement>(/^file$/i);
    expect(modelFileInput).toHaveAttribute('readonly');
  });
});
