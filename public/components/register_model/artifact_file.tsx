/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { EuiFormRow, EuiFilePicker } from '@elastic/eui';
import { useController } from 'react-hook-form';
import type { Control } from 'react-hook-form';

import { ModelFileFormData, ModelUrlFormData } from './register_model.types';

const ONE_MB = 1000 * 1000;
const MAX_FILE_SIZE = 80 * ONE_MB;

function validateFile(file: File) {
  if (file.size > MAX_FILE_SIZE) {
    return 'Maximum file size exceeded. Add a smaller file.';
  }
  return true;
}

export const ModelFileUploader = (props: {
  formControl: Control<ModelFileFormData | ModelUrlFormData>;
}) => {
  const modelFileFieldController = useController({
    name: 'modelFile',
    control: props.formControl,
    rules: {
      required: { value: true, message: 'A file is required. Add a file.' },
      validate: validateFile,
    },
    shouldUnregister: true,
  });

  return (
    <EuiFormRow
      label="File"
      helpText={`Accepted file format: TorchScript. Maximum file size, ${MAX_FILE_SIZE / ONE_MB}MB`}
      error={modelFileFieldController.fieldState.error?.message}
      isInvalid={Boolean(modelFileFieldController.fieldState.error)}
    >
      <EuiFilePicker
        display="default"
        initialPromptText="Select or drag and drop a file"
        isInvalid={Boolean(modelFileFieldController.fieldState.error)}
        onChange={(fileList) => {
          modelFileFieldController.field.onChange(fileList?.item(0));
        }}
      />
    </EuiFormRow>
  );
};
