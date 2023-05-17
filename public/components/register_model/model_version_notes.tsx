/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { EuiText, EuiSpacer } from '@elastic/eui';
import { useFormContext } from 'react-hook-form';

import type { ModelFileFormData, ModelUrlFormData } from './register_model.types';
import { ModelVersionNotesField } from '../common/forms/model_version_notes_field';

export const ModelVersionNotesPanel = () => {
  const { control } = useFormContext<ModelFileFormData | ModelUrlFormData>();

  return (
    <div>
      <EuiText size="s">
        <h3>Version information</h3>
      </EuiText>
      <EuiSpacer size="m" />
      <ModelVersionNotesField
        control={control}
        label={
          <>
            Version notes - <i style={{ fontWeight: 300 }}>optional</i>{' '}
          </>
        }
      />
    </div>
  );
};
