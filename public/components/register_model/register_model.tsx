import React, { useCallback } from 'react';
import { FieldErrors, useForm } from 'react-hook-form';
import { EuiPageHeader, EuiSpacer, EuiForm, EuiButton } from '@elastic/eui';

import { ModelDetailsPanel } from './model_details';
import type { ModelFileFormData, ModelUrlFormData } from './register_model.types';
import { ArtifactPanel } from './artifact';

interface RegisterModelFormProps {
  onSubmit?: (data: ModelFileFormData | ModelUrlFormData) => void;
}

export const RegisterModelForm = (props: RegisterModelFormProps) => {
  const { handleSubmit, control } = useForm<ModelFileFormData | ModelUrlFormData>({
    defaultValues: {
      version: 1,
    },
  });

  const onSubmit = (data: ModelFileFormData | ModelUrlFormData) => {
    if (props.onSubmit) {
      props.onSubmit(data);
    }
    // TODO
    console.log(data);
  };

  const onError = useCallback((errors: FieldErrors<ModelFileFormData | ModelUrlFormData>) => {
    // TODO
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
      <EuiButton type="submit" fill>
        Register model
      </EuiButton>
    </EuiForm>
  );
};
