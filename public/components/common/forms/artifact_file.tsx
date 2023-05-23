/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { EuiFormRow, EuiFilePicker, EuiText, EuiFieldText } from '@elastic/eui';
import { useController, useFormContext } from 'react-hook-form';

import { CUSTOM_FORM_ERROR_TYPES, MAX_MODEL_FILE_SIZE } from './form_constants';
import { ONE_GB } from '../../../../common/constant';

function validateFileSize(file?: File) {
  if (file && file.size > MAX_MODEL_FILE_SIZE) {
    return 'Maximum file size exceeded. Add a smaller file.';
  }
  return true;
}

export const UploadHelpText = () => (
  <>
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
  </>
);

interface Props {
  label?: string;
  readOnly?: boolean;
}

export const ModelFileUploader = ({ readOnly = false, label = 'File' }: Props) => {
  const { control, unregister } = useFormContext<{ modelFile?: File }>();
  const modelFileFieldController = useController({
    name: 'modelFile',
    control,
    rules: {
      required: { value: true, message: 'A file is required. Add a file.' },
      validate: {
        [CUSTOM_FORM_ERROR_TYPES.FILE_SIZE_EXCEED_LIMIT]: validateFileSize,
      },
    },
  });

  useEffect(() => {
    return () => {
      unregister('modelFile', { keepDefaultValue: true });
    };
  }, [unregister]);

  return readOnly ? (
    <EuiFormRow label={label}>
      <EuiFieldText icon="download" value={modelFileFieldController.field.value?.name} readOnly />
    </EuiFormRow>
  ) : (
    <EuiFormRow
      label={label}
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
