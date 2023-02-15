/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiCallOut, EuiText } from '@elastic/eui';
import React, { useMemo } from 'react';
import { useFormContext } from 'react-hook-form';

import type { ModelFileFormData, ModelUrlFormData } from './register_model.types';

export const ErrorCallOut = () => {
  const form = useFormContext<ModelFileFormData | ModelUrlFormData>();

  const errors = useMemo(() => {
    const messages: string[] = [];
    const errorKeys = Object.keys(form.formState.errors) as Array<
      keyof typeof form.formState.errors
    >;
    errorKeys.forEach((k) => {
      const errorMessage = form.formState.errors[k]?.message;
      if (k === 'tags') {
        messages.push('Found invalid tags');
      } else if (k === 'metric') {
        messages.push('Found invalid metric');
      } else if (errorMessage) {
        messages.push(errorMessage);
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
      title="Address errors in the form"
      color="danger"
      iconType="iInCircle"
    >
      <EuiText size="s">
        <span>Correct the following errors in the form</span>
        <ul style={{ listStyle: 'none', margin: 0 }}>
          {errors.map((e) => (
            <li key={e}>- {e}</li>
          ))}
        </ul>
      </EuiText>
    </EuiCallOut>
  );
};
