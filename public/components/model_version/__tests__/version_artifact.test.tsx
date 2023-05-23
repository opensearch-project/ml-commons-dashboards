/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import userEvent from '@testing-library/user-event';
import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { render, screen, within } from '../../../../test/test_utils';
import { ModelVersionFormData } from '../types';
import { ModelVersionArtifact } from '../version_artifact';

const DEFAULT_VALUES = {
  artifactSource: 'source_not_changed' as const,
  modelURL: 'http://url.to/artifact.zip',
  modelFileFormat: 'TORCH_SCRIPT',
  configuration: '{}',
};

const TestApp = ({ defaultValues = DEFAULT_VALUES }: { defaultValues?: ModelVersionFormData }) => {
  const form = useForm({
    defaultValues,
  });

  return (
    <FormProvider {...form}>
      <ModelVersionArtifact />
    </FormProvider>
  );
};

describe('<ModelVersionArtifact />', () => {
  it('should display a readonly "Artifact and configuration" panel', () => {
    render(<TestApp />);
    expect(screen.getByLabelText('Uploaded artifact details(URL)')).toHaveAttribute('readonly');
    expect(screen.getByLabelText('Model file format')).toHaveAttribute('readonly');
    expect(screen.getByLabelText('readonly configuration')).toBeInTheDocument();

    expect(screen.getByDisplayValue('http://url.to/artifact.zip')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Torchscript(.pt)')).toBeInTheDocument();
  });

  it('should display a readonly input with file name', () => {
    const defaultValues = {
      artifactSource: 'source_not_changed' as const,
      modelFile: new File([], 'artifact.zip'),
      modelFileFormat: 'TORCH_SCRIPT',
      configuration: '{}',
    };
    render(<TestApp defaultValues={defaultValues} />);
    expect(screen.getByDisplayValue('artifact.zip')).toBeInTheDocument();
    expect(screen.getByDisplayValue('artifact.zip')).toHaveAttribute('readonly');
  });

  it('should display "Artifact source select" after clicking "Edit" button', async () => {
    const user = userEvent.setup();
    render(<TestApp />);

    await user.click(screen.getByLabelText('edit version artifact'));
    expect(screen.getByText('Artifact source')).toBeInTheDocument();
    expect(screen.getByLabelText('Upload new from local file')).toBeInTheDocument();
    expect(screen.getByLabelText('Upload new from URL')).toBeInTheDocument();
  });

  it('should select "Keep existing" by default after click "Edit" button', async () => {
    const user = userEvent.setup();
    render(<TestApp />);

    await user.click(screen.getByLabelText('edit version artifact'));
    expect(screen.getByLabelText('Keep existing')).toBeChecked();
    // model url is readonly
    expect(screen.getByLabelText('Uploaded artifact details(URL)')).toHaveAttribute('readonly');
    // model file format is editable
    expect(screen.getByLabelText('Model file format')).not.toHaveAttribute('readonly');

    // configuration json input is editable
    expect(screen.getByLabelText('JSON configuration')).toBeEnabled();
    expect(screen.getByLabelText('JSON configuration')).not.toHaveAttribute('readonly');
  });

  it('should display model file upload input when selecting "Upload new from local file"', async () => {
    const user = userEvent.setup();
    render(<TestApp />);

    await user.click(screen.getByLabelText('edit version artifact'));
    await user.click(screen.getByLabelText('Upload new from local file'));

    expect(screen.getByLabelText(/file/i, { selector: 'input[type="file"]' })).toBeInTheDocument();
  });

  it('should display model URL input when selecting "Upload new from URL"', async () => {
    const user = userEvent.setup();
    render(<TestApp />);

    await user.click(screen.getByLabelText('edit version artifact'));
    await user.click(screen.getByLabelText('Upload new from URL'));

    const urlInput = screen.getByLabelText<HTMLInputElement>(/url/i, {
      selector: 'input[type="text"]',
    });
    expect(urlInput).toBeInTheDocument();
  });

  it('should display an editable "Model file format" when NOT selecting "Keep existing"', async () => {
    const user = userEvent.setup();
    render(<TestApp />);

    await user.click(screen.getByLabelText('edit version artifact'));

    await user.click(screen.getByLabelText('Upload new from local file'));
    expect(screen.getByLabelText('Model file format')).not.toHaveAttribute('readonly');

    await user.click(screen.getByLabelText('Upload new from URL'));
    expect(screen.getByLabelText('Model file format')).not.toHaveAttribute('readonly');
  });

  it('should reset form changes after clicking "Cancel" button', async () => {
    const user = userEvent.setup();
    render(<TestApp />);

    // model url field should display the default url
    expect(screen.getByLabelText('Uploaded artifact details(URL)')).toHaveDisplayValue(
      'http://url.to/artifact.zip'
    );
    // model file format should display the default file format
    expect(screen.getByLabelText('Model file format')).toHaveDisplayValue('Torchscript(.pt)');

    await user.click(screen.getByLabelText('edit version artifact'));
    await user.click(screen.getByLabelText('Upload new from URL'));

    // update model url
    const urlInput = screen.getByLabelText<HTMLInputElement>(/url/i, {
      selector: 'input[type="text"]',
    });
    await user.clear(urlInput);
    await user.type(urlInput, 'http://ur.new/artifact.zip');

    // select another model file format
    const input = screen.getByLabelText<HTMLInputElement>(/model file format/i);
    await user.click(input);
    const listBox = screen.getByRole('listBox');
    await user.click(within(listBox).getByText('ONNX(.onnx)'));

    await user.click(screen.getByLabelText('cancel edit version artifact'));
    expect(screen.getByLabelText('Uploaded artifact details(URL)')).toHaveDisplayValue(
      'http://url.to/artifact.zip'
    );
    expect(screen.getByLabelText('Model file format')).toHaveDisplayValue('Torchscript(.pt)');
  });

  it('should NOT change artifact(via URL) after selecting "Keep existing"', async () => {
    const user = userEvent.setup();
    render(<TestApp />);

    await user.click(screen.getByLabelText('edit version artifact'));

    // model url field should display the default url
    expect(screen.getByLabelText('Uploaded artifact details(URL)')).toHaveDisplayValue(
      'http://url.to/artifact.zip'
    );

    // starts to edit url
    await user.click(screen.getByLabelText('Upload new from URL'));
    // update model url
    const urlInput = screen.getByLabelText<HTMLInputElement>(/url/i, {
      selector: 'input[type="text"]',
    });
    await user.clear(urlInput);
    await user.type(urlInput, 'http://ur.new/artifact.zip');

    await user.click(screen.getByLabelText('Keep existing'));
    expect(screen.getByLabelText('Uploaded artifact details(URL)')).toHaveDisplayValue(
      'http://url.to/artifact.zip'
    );
  });

  it('should NOT change artifact(via file upload) after selecting "Keep existing"', async () => {
    const user = userEvent.setup();
    render(<TestApp />);

    await user.click(screen.getByLabelText('edit version artifact'));

    // model url field should display the default url
    expect(screen.getByLabelText('Uploaded artifact details(URL)')).toHaveDisplayValue(
      'http://url.to/artifact.zip'
    );

    // starts to upload model file
    await user.click(screen.getByLabelText('Upload new from local file'));
    const modelFileInput = screen.getByLabelText<HTMLInputElement>(/^file$/i);
    const file = new File(['test model file'], 'model.zip', { type: 'application/zip' });
    await user.upload(modelFileInput, file);

    await user.click(screen.getByLabelText('Keep existing'));
    expect(screen.getByLabelText('Uploaded artifact details(URL)')).toHaveDisplayValue(
      'http://url.to/artifact.zip'
    );
  });
});
