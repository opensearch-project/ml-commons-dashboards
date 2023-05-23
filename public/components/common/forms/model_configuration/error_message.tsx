/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { FieldError } from 'react-hook-form';

interface ErrorMessageProps {
  error?: FieldError;
}

export const ErrorMessage = ({ error }: ErrorMessageProps) => {
  if (!error) {
    return null;
  }

  if (error.types) {
    return (
      <ul style={{ listStyle: 'none', margin: 0 }}>
        {Object.keys(error.types).map((k) => (
          <li key={k}>{error.types?.[k]}</li>
        ))}
      </ul>
    );
  }

  return <span>{error.message}</span>;
};
