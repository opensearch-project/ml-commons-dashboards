import React, { useCallback } from 'react';
import { FieldErrors, useForm } from 'react-hook-form';
import { EuiPageHeader, EuiSpacer, EuiForm, EuiButton } from '@elastic/eui';

import { ModelDetailsPanel } from './model_details';
import { RegisterModelForm } from './register_model.types';

export const RegisterModel = () => {
  const { handleSubmit, control } = useForm<RegisterModelForm>({
    defaultValues: {
      version: 1,
    },
  });

  const onSubmit = useCallback((data: RegisterModelForm) => {
    console.log(data);
  }, []);

  const onError = useCallback((errors: FieldErrors<RegisterModelForm>) => {
    console.log(errors);
  }, []);

  return (
    <EuiForm onSubmit={handleSubmit(onSubmit, onError)} component="form">
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
