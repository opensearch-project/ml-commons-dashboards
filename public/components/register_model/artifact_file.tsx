import React from 'react';
import { EuiFormRow, EuiFilePicker } from '@elastic/eui';
import { useController } from 'react-hook-form';
import type { Control } from 'react-hook-form';

import { FORM_ITEM_WIDTH } from './form_constants';
import { RegisterModelFormData } from './register_model.types';

export const ModelFileUploader: React.FC<{ formControl: Control<RegisterModelFormData> }> = (
  props
) => {
  const modelFileFieldController = useController({
    name: 'modelFile',
    control: props.formControl,
    rules: { required: true },
    shouldUnregister: true,
  });

  return (
    <EuiFormRow
      fullWidth
      style={{ maxWidth: FORM_ITEM_WIDTH * 2 }}
      label="Model file"
      helpText="Accepted file format: Torchscript. Maximum file size, XMB"
      isInvalid={Boolean(modelFileFieldController.fieldState.error)}
    >
      <EuiFilePicker
        initialPromptText="Select or drag and drop a file"
        fullWidth
        isInvalid={Boolean(modelFileFieldController.fieldState.error)}
        onChange={(fileList) => {
          modelFileFieldController.field.onChange(fileList?.item(0));
        }}
      />
    </EuiFormRow>
  );
};
