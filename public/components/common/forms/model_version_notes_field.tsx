/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { EuiFormRow, EuiTextArea } from '@elastic/eui';
import { useController, useFormContext } from 'react-hook-form';

interface Props {
  label: React.ReactNode;
  readOnly?: boolean;
}

const VERSION_NOTES_MAX_LENGTH = 200;

export const ModelVersionNotesField = ({ label, readOnly = false }: Props) => {
  const { control } = useFormContext<{ versionNotes?: string }>();
  const fieldController = useController({
    name: 'versionNotes',
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
        readOnly={readOnly}
        inputRef={ref}
        isInvalid={Boolean(fieldController.fieldState.error)}
        maxLength={VERSION_NOTES_MAX_LENGTH}
        style={{ height: 80 }}
        {...versionNotesField}
      />
    </EuiFormRow>
  );
};
