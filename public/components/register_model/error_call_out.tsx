/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiCallOut, EuiText } from '@elastic/eui';
import React, { useMemo } from 'react';
import { useFormContext } from 'react-hook-form';
import { FORM_ERRORS } from './constants';

import type { ModelFileFormData, ModelUrlFormData } from './register_model.types';

export const ErrorCallOut = () => {
  const form = useFormContext<ModelFileFormData | ModelUrlFormData>();
  console.log(form.formState.errors);

  const errors = useMemo(() => {
    const messages: string[] = [];
    for (const errorField in form.formState.errors) {
      const error = form.formState.errors[errorField as keyof typeof form.formState.errors];
      const errorMessage = FORM_ERRORS.find(
        (e) => e.field === errorField && e.type === error?.type
      );
      if (errorMessage) {
        messages.push(errorMessage.message);
      }
    }
    return messages;
  }, [form]);

  if (errors.length === 0) {
    return null;
  }

  return (
    <EuiCallOut
      aria-label="Address errors in the form"
      title="Address the following error(s) in the form"
      color="danger"
      iconType="iInCircle"
    >
      <EuiText size="s">
        <ul style={{ listStyle: 'none', margin: 0 }}>
          {errors.map((e) => (
            <li key={e}>- {e}</li>
          ))}
        </ul>
      </EuiText>
    </EuiCallOut>
  );
};
