/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useState } from 'react';
import { EuiCheckbox, EuiText, EuiFormRow } from '@elastic/eui';
import { useController, useFormContext } from 'react-hook-form';
import { useSearchParams } from '../../hooks/use_search_params';
export const ModelDeployment = () => {
  const searchParams = useSearchParams();
  const typeParams = searchParams.get('type');
  const [checked, setChecked] = useState(false);
  const { control } = useFormContext<{ deployment: boolean }>();
  const modelDeploymentController = useController({
    name: 'deployment',
    control,
  });

  const { ref: deploymentInputRef, ...deploymentField } = modelDeploymentController.field;
  const onDeploymentChange = useCallback(
    (e) => {
      setChecked(e.target.checked);
      deploymentField.onChange(checked);
    },
    [deploymentField, checked]
  );
  return (
    <EuiFormRow label={typeParams === 'external' ? 'Activation' : 'Deployment'}>
      <div>
        {<EuiText size="xs">Needs a description</EuiText>}
        {(typeParams === 'upload' || typeParams === 'import') && (
          <EuiCheckbox
            id="deployment"
            label="Start deployment automatically"
            checked={checked}
            onChange={onDeploymentChange}
          />
        )}
        {typeParams === 'external' && (
          <EuiCheckbox
            id="activation"
            label="Activate on registration"
            checked={checked}
            onChange={onDeploymentChange}
          />
        )}
      </div>
    </EuiFormRow>
  );
};
