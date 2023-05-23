/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { EuiFormRow, htmlIdGenerator, EuiFieldText, EuiCopy, EuiIcon } from '@elastic/eui';
import { useController, useFormContext } from 'react-hook-form';

import { URL_REGEX } from '../../../utils/regex';

interface Props {
  label?: string;
  readOnly?: boolean;
}

export const ModelArtifactUrl = ({ label = 'URL', readOnly = false }: Props) => {
  const { control, unregister } = useFormContext<{ modelURL?: string }>();
  const modelUrlFieldController = useController({
    name: 'modelURL',
    control,
    rules: {
      required: { value: true, message: 'URL is required. Enter a URL.' },
      pattern: { value: URL_REGEX, message: 'URL is invalid. Enter a valid URL.' },
    },
  });

  useEffect(() => {
    return () => {
      unregister('modelURL', { keepDefaultValue: true });
    };
  }, [unregister]);

  return readOnly ? (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <EuiFormRow label={label} style={{ width: 400 }}>
        <EuiFieldText value={modelUrlFieldController.field.value} readOnly />
      </EuiFormRow>
      <EuiCopy textToCopy={modelUrlFieldController.field.value ?? ''}>
        {(copy) => (
          <EuiIcon
            style={{ marginLeft: 10, transform: 'translateY(10px)', cursor: 'pointer' }}
            type="copy"
            onClick={copy}
          />
        )}
      </EuiCopy>
    </div>
  ) : (
    <EuiFormRow
      label={label}
      isInvalid={Boolean(modelUrlFieldController.fieldState.error)}
      error={modelUrlFieldController.fieldState.error?.message}
    >
      <EuiFieldText
        inputRef={modelUrlFieldController.field.ref}
        id={htmlIdGenerator()()}
        placeholder="Link to the model"
        isInvalid={Boolean(modelUrlFieldController.fieldState.error)}
        value={modelUrlFieldController.field.value ?? ''}
        name={modelUrlFieldController.field.name}
        onChange={modelUrlFieldController.field.onChange}
        onBlur={modelUrlFieldController.field.onBlur}
      />
    </EuiFormRow>
  );
};
