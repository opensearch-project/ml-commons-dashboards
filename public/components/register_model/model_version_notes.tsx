/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { EuiTitle, EuiSpacer, EuiFormRow, EuiTextArea } from '@elastic/eui';
import { useFormContext, useController } from 'react-hook-form';

import type { ModelFileFormData, ModelUrlFormData } from './register_model.types';

const VERSION_NOTES_MAX_LENGTH = 200;

export const ModelVersionNotesPanel = () => {
  const { control } = useFormContext<ModelFileFormData | ModelUrlFormData>();

  const fieldController = useController({
    name: 'versionNotes',
    control,
    rules: { maxLength: { value: VERSION_NOTES_MAX_LENGTH, message: 'Text exceed max length' } },
  });
  const { ref, ...versionNotesField } = fieldController.field;

  return (
    <div>
      <EuiTitle size="s">
        <h3>
          Version notes - <i style={{ fontWeight: 300 }}>optional</i>
        </h3>
      </EuiTitle>
      <EuiSpacer size="m" />
      <EuiFormRow
        helpText={`${Math.max(
          VERSION_NOTES_MAX_LENGTH - (versionNotesField.value?.length ?? 0),
          0
        )} characters allowed.`}
        isInvalid={Boolean(fieldController.fieldState.error)}
        error={fieldController.fieldState.error?.message}
        label="Notes"
      >
        <EuiTextArea
          inputRef={ref}
          isInvalid={Boolean(fieldController.fieldState.error)}
          maxLength={VERSION_NOTES_MAX_LENGTH}
          style={{ height: 80 }}
          {...versionNotesField}
        />
      </EuiFormRow>
    </div>
  );
};
