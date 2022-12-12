import React, { useCallback } from 'react';
import { FieldErrors, useForm } from 'react-hook-form';
import { EuiPageHeader, EuiSpacer, EuiForm, EuiButton } from '@elastic/eui';

import { ModelDetailsPanel } from './model_details';
import type { RegisterModelFormData } from './register_model.types';

interface RegisterModelFormProps {
  onSubmit?: (data: RegisterModelFormData) => void;
}

export const RegisterModelForm: React.FC<RegisterModelFormProps> = (props) => {
  const { handleSubmit, control } = useForm<RegisterModelFormData>({
    defaultValues: {
      version: 1,
    },
  });

  const onSubmit = (data: RegisterModelFormData) => {
    if (props.onSubmit) {
      props.onSubmit(data);
    }
    console.log(data);
  };

  const onError = useCallback((errors: FieldErrors<RegisterModelFormData>) => {
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
      <EuiButton type="submit" fill>
        Register model
      </EuiButton>
    </EuiForm>
  );
};
