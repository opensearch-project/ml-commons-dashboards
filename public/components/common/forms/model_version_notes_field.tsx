/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { EuiFormRow, EuiTextArea } from '@elastic/eui';
import { FieldPathByValue, useController } from 'react-hook-form';
import type { Control } from 'react-hook-form';

interface VersionNotesFormData {
  versionNotes?: string;
}

interface Props<T extends VersionNotesFormData> {
  label: React.ReactNode;
  control: Control<T>;
  readOnly?: boolean;
}

const VERSION_NOTES_MAX_LENGTH = 200;

export const ModelVersionNotesField = <T extends VersionNotesFormData>({
  control,
  label,
  readOnly = false,
}: Props<T>) => {
  const fieldController = useController({
    name: 'versionNotes' as FieldPathByValue<T, string>,
    control,
  });
  const { ref, ...versionNotesField } = fieldController.field;

  return (
    <EuiFormRow
      helpText={`${Math.max(
        VERSION_NOTES_MAX_LENGTH - (versionNotesField.value?.length ?? 0),
        0
      )} characters ${versionNotesField.value?.length ? 'left' : 'allowed'}.`}
      isInvalid={Boolean(fieldController.fieldState.error)}
      error={fieldController.fieldState.error?.message}
      label={label}
    >
      <EuiTextArea
        disabled={readOnly}
        inputRef={ref}
        isInvalid={Boolean(fieldController.fieldState.error)}
        maxLength={VERSION_NOTES_MAX_LENGTH}
        style={{ height: 80 }}
        {...versionNotesField}
      />
    </EuiFormRow>
  );
};
