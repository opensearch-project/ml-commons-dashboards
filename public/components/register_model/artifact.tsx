/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useMemo, useState } from 'react';
import {
  htmlIdGenerator,
  EuiSpacer,
  EuiText,
  EuiRadio,
  EuiLink,
  EuiFormRow,
  EuiComboBox,
  EuiComboBoxOptionOption,
} from '@elastic/eui';
import { useController, useFormContext } from 'react-hook-form';

import { ModelFileUploader } from './artifact_file';
import { ArtifactUrl } from './artifact_url';
import { ONE_GB } from '../../../common/constant';
import { MAX_MODEL_FILE_SIZE } from './constants';
import { ModelFileFormData, ModelUrlFormData } from './register_model.types';

const FILE_FORMAT_OPTIONS = [
  {
    label: 'ONNX(.onnx)',
    value: 'ONNX',
  },
  {
    label: 'Torchscript(.pt)',
    value: 'TORCH_SCRIPT',
  },
];

export const ArtifactPanel = () => {
  const { control } = useFormContext<ModelFileFormData | ModelUrlFormData>();
  const [selectedSource, setSelectedSource] = useState<'source_from_computer' | 'source_from_url'>(
    'source_from_computer'
  );

  const modelFileFormatController = useController({
    name: 'modelFileFormat',
    control,
    rules: {
      required: {
        value: true,
        message: 'Model file format is required. Select a model file format.',
      },
    },
  });

  const { ref: fileFormatInputRef, ...fileFormatField } = modelFileFormatController.field;

  const selectedFileFormatOption = useMemo(() => {
    if (fileFormatField.value) {
      return FILE_FORMAT_OPTIONS.find((fmt) => fmt.value === fileFormatField.value);
    }
  }, [fileFormatField]);

  const onFileFormatChange = useCallback(
    (options: Array<EuiComboBoxOptionOption<string>>) => {
      const value = options[0]?.value;
      fileFormatField.onChange(value);
    },
    [fileFormatField]
  );

  return (
    <div>
      <EuiText size="s">
        <h3>Artifact</h3>
      </EuiText>
      <EuiText style={{ maxWidth: 725 }}>
        <small>
          The zipped artifact must include a model file and a tokenizer file. If uploading with a
          local file, keep this browser open util the upload completes.{' '}
          <EuiLink href="http://www.example.com" external>
            Learn more
          </EuiLink>
        </small>
      </EuiText>
      <EuiSpacer size="m" />
      <EuiRadio
        id={htmlIdGenerator()()}
        name="modelSource"
        label="From computer"
        value="source_from_computer"
        checked={selectedSource === 'source_from_computer'}
        onChange={() => setSelectedSource('source_from_computer')}
      />
      <EuiRadio
        id={htmlIdGenerator()()}
        name="modelSource"
        label="From URL"
        value="source_from_url"
        checked={selectedSource === 'source_from_url'}
        onChange={() => setSelectedSource('source_from_url')}
      />
      <EuiSpacer size="m" />
      {selectedSource === 'source_from_computer' && <ModelFileUploader />}
      {selectedSource === 'source_from_url' && <ArtifactUrl />}
      <EuiSpacer size="xs" />
      <EuiText size="xs" color="subdued">
        Accepted file format: ZIP (.zip). Maximum size, {MAX_MODEL_FILE_SIZE / ONE_GB}GB.
      </EuiText>
      <EuiText size="xs" color="subdued">
        The ZIP mush include the following contents:
        <ul>
          <li>Model File, accepted formats: Torchscript(.pt), ONNX(.onnx)</li>
          <li>Tokenizer file, accepted format: JSON(.json)</li>
        </ul>
      </EuiText>
      <EuiSpacer />
      <EuiFormRow
        label="Model file format"
        error={modelFileFormatController.fieldState.error?.message}
        isInvalid={Boolean(modelFileFormatController.fieldState.error)}
      >
        <EuiComboBox
          inputRef={fileFormatInputRef}
          options={FILE_FORMAT_OPTIONS}
          singleSelection={{ asPlainText: true }}
          selectedOptions={selectedFileFormatOption ? [selectedFileFormatOption] : []}
          placeholder="Select a format"
          onChange={onFileFormatChange}
        />
      </EuiFormRow>
    </div>
  );
};
