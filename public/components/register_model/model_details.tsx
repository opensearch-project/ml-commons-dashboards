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
  const { control, trigger } = useFormContext<ModelFileFormData | ModelUrlFormData>();

  return (
    <div>
      <EuiText size="s">
        <h3>Details</h3>
      </EuiText>
      <ModelNameField control={control} trigger={trigger} />
      <ModelDescriptionField control={control} />
    </div>
  );
};
