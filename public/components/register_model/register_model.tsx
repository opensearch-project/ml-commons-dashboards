/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback } from 'react';
import { FieldErrors, useForm } from 'react-hook-form';
import { EuiPageHeader, EuiSpacer, EuiForm, EuiButton } from '@elastic/eui';

import { ModelDetailsPanel } from './model_details';
import type { ModelFileFormData, ModelUrlFormData } from './register_model.types';
import { ArtifactPanel } from './artifact';
import { ConfigurationPanel } from './model_configuration';
import { EvaluationMetricsPanel } from './evaluation_metrics';
import { ModelTagsPanel } from './model_tags';

export interface RegisterModelFormProps {
  onSubmit?: (data: ModelFileFormData | ModelUrlFormData) => void;
}

export const RegisterModelForm = (props: RegisterModelFormProps) => {
  const { handleSubmit, control } = useForm<ModelFileFormData | ModelUrlFormData>({
    defaultValues: {
      name: '',
      description: '',
      version: '1',
      configuration: '{}',
      tags: [{ key: '', value: '' }],
    },
  });

  const onSubmit = (data: ModelFileFormData | ModelUrlFormData) => {
    if (props.onSubmit) {
      props.onSubmit(data);
    }
    // TODO
    // eslint-disable-next-line no-console
    console.log(data);
  };

  const onError = useCallback((errors: FieldErrors<ModelFileFormData | ModelUrlFormData>) => {
    // TODO
    // eslint-disable-next-line no-console
    console.log(errors);
  }, []);

  return (
    <EuiForm
      data-test-subj="mlCommonsPlugin-registerModelForm"
      onSubmit={handleSubmit(onSubmit, onError)}
      component="form"
    >
      <EuiPageHeader pageTitle="Register Model" />
      <EuiSpacer />
      <ModelDetailsPanel formControl={control} />
      <EuiSpacer />
      <ArtifactPanel formControl={control} />
      <EuiSpacer />
      <ConfigurationPanel formControl={control} />
      <EuiSpacer />
      <EvaluationMetricsPanel formControl={control} />
      <EuiSpacer />
      <ModelTagsPanel formControl={control} />
      <EuiSpacer />
      <EuiButton type="submit" fill>
        Register model
      </EuiButton>
    </EuiForm>
  );
};
