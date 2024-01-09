/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { EuiCheckbox, EuiText, EuiFormRow } from '@elastic/eui';
import { useController, useFormContext } from 'react-hook-form';
import { useSearchParams } from '../../hooks/use_search_params';

export const ModelDeployment = () => {
  const searchParams = useSearchParams();
  const typeParams = searchParams.get('type');
  const { control } = useFormContext<{ deployment: boolean }>();
  const modelDeploymentController = useController({
    name: 'deployment',
    control,
    defaultValue: false,
  });
  const isRegisterExternal = typeParams === 'external';

  const { ref: deploymentInputRef, ...deploymentField } = modelDeploymentController.field;
  return (
    <EuiFormRow
      label={isRegisterExternal ? 'Activation' : 'Deployment'}
      labelAppend={
        <EuiText size="xs" color="subdued" style={{ width: '100%' }}>
          Need a description, mention of “in use” might make sense
        </EuiText>
      }
    >
      <EuiCheckbox
        id="deployment"
        label={isRegisterExternal ? 'Activate on registration' : 'Start deployment automatically'}
        aria-label={
          isRegisterExternal ? 'Activate on registration' : 'Start deployment automatically'
        }
        checked={deploymentField.value}
        onChange={deploymentField.onChange}
      />
    </EuiFormRow>
  );
};
