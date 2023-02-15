/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { EuiFormRow, EuiFilePicker } from '@elastic/eui';
import { useController, useFormContext } from 'react-hook-form';

import { ModelFileFormData, ModelUrlFormData } from './register_model.types';
import { CUSTOM_FORM_ERROR_TYPES, MAX_MODEL_FILE_SIZE } from './constants';

function validateFileSize(file: File) {
  if (file.size > MAX_MODEL_FILE_SIZE) {
    return 'Maximum file size exceeded. Add a smaller file.';
  }
  return true;
}

export const ModelFileUploader = () => {
  const { control } = useFormContext<ModelFileFormData | ModelUrlFormData>();
  const modelFileFieldController = useController({
    name: 'modelFile',
    control,
    rules: {
      required: { value: true, message: 'A file is required. Add a file.' },
      validate: { [CUSTOM_FORM_ERROR_TYPES.FILE_SIZE_EXCEED_LIMIT]: validateFileSize },
    },
    shouldUnregister: true,
  });

  return (
    <EuiFormRow
      label="File"
      error={modelFileFieldController.fieldState.error?.message}
      isInvalid={Boolean(modelFileFieldController.fieldState.error)}
    >
      <EuiFilePicker
        display="default"
        accept=".zip"
        initialPromptText="Select or drag and drop a file"
        isInvalid={Boolean(modelFileFieldController.fieldState.error)}
        onChange={(fileList) => {
          modelFileFieldController.field.onChange(fileList?.item(0));
        }}
      />
    </EuiFormRow>
  );
};
