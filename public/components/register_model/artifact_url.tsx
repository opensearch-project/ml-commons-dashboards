/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { EuiFormRow, htmlIdGenerator, EuiFieldText } from '@elastic/eui';
import { useController, useFormContext } from 'react-hook-form';

import { FORM_ITEM_WIDTH } from './form_constants';
import type { ModelFileFormData, ModelUrlFormData } from './register_model.types';
import { URL_REGEX } from '../../utils/regex';

export const ArtifactUrl = () => {
  const { control } = useFormContext<ModelFileFormData | ModelUrlFormData>();
  const modelUrlFieldController = useController({
    name: 'modelURL',
    control,
    rules: {
      required: { value: true, message: 'URL is required. Enter a URL.' },
      pattern: { value: URL_REGEX, message: 'URL is invalid. Enter a valid URL.' },
    },
    shouldUnregister: true,
  });

  return (
    <EuiFormRow
      style={{ maxWidth: FORM_ITEM_WIDTH * 2 }}
      label="URL"
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
