/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiComboBox, EuiComboBoxOptionOption, EuiFieldText, EuiFormRow } from '@elastic/eui';
import { useController, useFormContext } from 'react-hook-form';
import React, { useMemo, useCallback } from 'react';

export const FILE_FORMAT_OPTIONS = [
  {
    label: 'ONNX(.onnx)',
    value: 'ONNX',
  },
  {
    label: 'Torchscript(.pt)',
    value: 'TORCH_SCRIPT',
  },
];

interface Props {
  readOnly?: boolean;
}

export const ModelFileFormatSelect = ({ readOnly = false }: Props) => {
  const { control } = useFormContext<{ modelFileFormat: string }>();

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
    <EuiFormRow
      label="Model file format"
      error={modelFileFormatController.fieldState.error?.message}
      isInvalid={Boolean(modelFileFormatController.fieldState.error)}
    >
      {readOnly ? (
        <EuiFieldText value={selectedFileFormatOption?.label} readOnly />
      ) : (
        <EuiComboBox
          inputRef={fileFormatInputRef}
          options={FILE_FORMAT_OPTIONS}
          singleSelection={{ asPlainText: true }}
          selectedOptions={selectedFileFormatOption ? [selectedFileFormatOption] : []}
          placeholder="Select a format"
          onChange={onFileFormatChange}
        />
      )}
    </EuiFormRow>
  );
};
