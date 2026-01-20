/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import userEvent from '@testing-library/user-event';

import { render, screen } from '../../../../../test/test_utils';
import { ModelArtifactUrl } from '../artifact_url';

const TestApp = ({
  readOnly = false,
  onSubmit = jest.fn(),
  onError = jest.fn(),
}: {
  readOnly?: boolean;
  onSubmit?: () => any;
  onError?: () => any;
}) => {
  const form = useForm({
    defaultValues: {},
    mode: 'onChange',
  });

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit, onError)}>
        <ModelArtifactUrl label="URL" readOnly={readOnly} />
        <button type="submit">Submit</button>
      </form>
    </FormProvider>
  );
};

describe('<ModelArtifactUrl />', () => {
  it('should render a URL input field', () => {
    render(<TestApp />);

    const urlInput = screen.getByLabelText<HTMLInputElement>(/url/i, {
      selector: 'input[type="text"]',
    });
    expect(urlInput).toBeInTheDocument();
  });

  it('should display URL input as readonly', () => {
    render(<TestApp readOnly />);
    const urlInput = screen.getByLabelText<HTMLInputElement>(/url/i, {
      selector: 'input[type="text"]',
    });
    expect(urlInput).toHaveAttribute('readonly');
  });

  it('should display error message if URL is invalid', async () => {
    const user = userEvent.setup();
    render(<TestApp />);

    const urlInput = screen.getByLabelText<HTMLInputElement>(/url/i, {
      selector: 'input[type="text"]',
    });
    await user.type(urlInput, 'invalid_url');
    expect(urlInput).toBeInvalid();
    expect(screen.getByText('URL is invalid. Enter a valid URL.')).toBeInTheDocument();
  });

  it('should NOT display error message if URL is valid', async () => {
    const user = userEvent.setup();
    render(<TestApp />);

    const urlInput = screen.getByLabelText<HTMLInputElement>(/url/i, {
      selector: 'input[type="text"]',
    });
    await user.type(urlInput, 'https://url.to/artifact.zip');
    expect(urlInput).toBeValid();
    expect(screen.queryByText('URL is invalid. Enter a valid URL.')).not.toBeInTheDocument();
  });

  it('should display error message if URL is empty', async () => {
    const user = userEvent.setup();
    render(<TestApp />);

    const urlInput = screen.getByLabelText<HTMLInputElement>(/url/i, {
      selector: 'input[type="text"]',
    });
    await user.clear(urlInput);
    await user.click(screen.getByText('Submit'));
    expect(urlInput).toBeInvalid();
    expect(screen.getByText('URL is required. Enter a URL.')).toBeInTheDocument();
  });
});
