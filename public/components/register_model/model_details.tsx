/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { EuiText } from '@elastic/eui';
import { useFormContext } from 'react-hook-form';

import { ModelNameField, ModelDescriptionField } from '../../components/common';

import { ModelFileFormData, ModelUrlFormData } from './register_model.types';

export const ModelDetailsPanel = () => {
  const { control, trigger, watch } = useFormContext<ModelFileFormData | ModelUrlFormData>();
  const type = watch('type');

  return (
    <div>
      <EuiText size="s">
        <h3>Details</h3>
      </EuiText>
      <ModelNameField readOnly={type === 'import'} control={control} trigger={trigger} />
      <ModelDescriptionField control={control} />
    </div>
  );
};
