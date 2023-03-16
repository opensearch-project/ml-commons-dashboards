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

  const errors = useMemo(() => {
    const messages: string[] = [];
    Object.keys(form.formState.errors).forEach((errorField) => {
      const error = form.formState.errors[errorField as keyof typeof form.formState.errors];
      // If form have: criteriaMode: 'all', error.types will be set a value
      // error.types will contain all the errors of each field
      // In this case, we will display all the errors in the callout
      if (error?.types) {
        Object.keys(error.types).forEach((k) => {
          const errorMessage = FORM_ERRORS.find((e) => e.field === errorField && e.type === k);
          if (errorMessage) {
            messages.push(errorMessage.message);
          }
        });
      } else {
        // If form didn't have: criteriaMode: 'all', the default behavior of react-hook-form is
        // to only produce the first error, even if a field has multiple errors.
        // In this case, error.types won't be set, and error.type and error.field represent the
        // first error
        const errorMessage = FORM_ERRORS.find(
          (e) => e.field === errorField && e.type === error?.type
        );
        if (errorMessage) {
          messages.push(errorMessage.message);
        }
      }
    });
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
