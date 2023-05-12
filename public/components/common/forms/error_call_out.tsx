/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiCallOut, EuiText } from '@elastic/eui';
import React, { useMemo } from 'react';
import { FieldErrors } from 'react-hook-form';

interface ErrorCallOutProps {
  formErrors: FieldErrors;
  errorMessages: Array<{
    field: string;
    type: string;
    message: string;
  }>;
}

export const ErrorCallOut = ({ formErrors, errorMessages }: ErrorCallOutProps) => {
  const errors = useMemo(() => {
    const messages: string[] = [];
    Object.keys(formErrors).forEach((errorField) => {
      const error = formErrors[errorField as keyof typeof formErrors];
      // If form have: criteriaMode: 'all', error.types will be set a value
      // error.types will contain all the errors of each field
      // In this case, we will display all the errors in the callout
      if (error?.types) {
        Object.keys(error.types).forEach((k) => {
          const errorMessage = errorMessages.find((e) => e.field === errorField && e.type === k);
          if (errorMessage) {
            messages.push(errorMessage.message);
          }
        });
      } else {
        // If form didn't have: criteriaMode: 'all', the default behavior of react-hook-form is
        // to only produce the first error, even if a field has multiple errors.
        // In this case, error.types won't be set, and error.type and error.field represent the
        // first error
        const errorMessage = errorMessages.find(
          (e) => e.field === errorField && e.type === error?.type
        );
        if (errorMessage) {
          messages.push(errorMessage.message);
        }
      }
    });
    return messages;
  }, [formErrors, errorMessages]);

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
        <ul style={{ listStyle: 'inside', margin: 0, marginLeft: 6 }}>
          {errors.map((e) => (
            <li key={e}>- {e}</li>
          ))}
        </ul>
      </EuiText>
    </EuiCallOut>
  );
};
