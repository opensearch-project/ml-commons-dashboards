/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

import { EuiFormRow, EuiTextArea } from '@elastic/eui';
import { Control, FieldPathByValue, useController } from 'react-hook-form';

interface ModeDescriptionFormData {
  description: string;
}

const DESCRIPTION_MAX_LENGTH = 200;

interface ModelDescriptionFieldProps<TFieldValues extends ModeDescriptionFormData> {
  control: Control<TFieldValues>;
}

export const ModelDescriptionField = <TFieldValues extends ModeDescriptionFormData>({
  control,
}: ModelDescriptionFieldProps<TFieldValues>) => {
  const descriptionFieldController = useController({
    name: 'description' as FieldPathByValue<TFieldValues, string>,
    control,
  });

  const { ref: descriptionInputRef, ...descriptionField } = descriptionFieldController.field;

  return (
    <EuiFormRow
      label={
        <>
          Description - <i style={{ fontWeight: 300 }}>optional</i>
        </>
      }
      isInvalid={Boolean(descriptionFieldController.fieldState.error)}
      error={descriptionFieldController.fieldState.error?.message}
      helpText={`${Math.max(
        DESCRIPTION_MAX_LENGTH - descriptionField.value.length,
        0
      )} characters ${descriptionField.value.length ? 'left' : 'allowed'}.`}
    >
      <EuiTextArea
        inputRef={descriptionInputRef}
        isInvalid={Boolean(descriptionFieldController.fieldState.error)}
        maxLength={DESCRIPTION_MAX_LENGTH}
        {...descriptionField}
      />
    </EuiFormRow>
  );
};
