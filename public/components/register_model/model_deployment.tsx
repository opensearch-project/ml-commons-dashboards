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
    <EuiFormRow label={isRegisterExternal ? 'Activation' : 'Deployment'}>
      <div>
        {<EuiText size="xs">Needs a description</EuiText>}
        <EuiCheckbox
          id="deployment"
          label={isRegisterExternal ? 'Activate on registration' : 'Start deployment automatically'}
          aria-label={
            isRegisterExternal ? 'Activate on registration' : 'Start deployment automatically'
          }
          checked={deploymentField.value}
          onChange={deploymentField.onChange}
        />
      </div>
    </EuiFormRow>
  );
};
