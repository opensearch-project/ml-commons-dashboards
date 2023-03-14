/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useRef } from 'react';
import { EuiFieldText, EuiFormRow, EuiTitle, EuiTextArea, EuiText } from '@elastic/eui';
import { useController, useFormContext } from 'react-hook-form';
import { ModelFileFormData, ModelUrlFormData } from './register_model.types';
import { APIProvider } from '../../apis/api_provider';

const NAME_MAX_LENGTH = 80;
const DESCRIPTION_MAX_LENGTH = 200;

const isDuplicateModelName = async (name: string) => {
  const searchResult = await APIProvider.getAPI('model').search({
    name,
    from: 0,
    size: 1,
  });
  return searchResult.total_models >= 1;
};

export const ModelDetailsPanel = () => {
  const { control, trigger } = useFormContext<ModelFileFormData | ModelUrlFormData>();
  const modelNameFocusedRef = useRef(false);
  const nameFieldController = useController({
    name: 'name',
    control,
    rules: {
      required: { value: true, message: 'Name can not be empty' },
      validate: async (name) => {
        return !modelNameFocusedRef.current && !!name && (await isDuplicateModelName(name))
          ? 'This name is already in use. Use a unique name for the model.'
          : undefined;
      },
    },
  });

  const descriptionFieldController = useController({
    name: 'description',
    control,
    rules: {
      required: { value: true, message: 'Description can not be empty' },
    },
  });

  const { ref: nameInputRef, ...nameField } = nameFieldController.field;
  const { ref: descriptionInputRef, ...descriptionField } = descriptionFieldController.field;

  const handleModelNameFocus = useCallback(() => {
    modelNameFocusedRef.current = true;
  }, []);

  const handleModelNameBlur = useCallback(() => {
    nameField.onBlur();
    modelNameFocusedRef.current = false;
    trigger('name');
  }, [nameField, trigger]);

  return (
    <div>
      <EuiTitle size="s">
        <h3>Model Details</h3>
      </EuiTitle>
      <EuiFormRow
        label="Name"
        isInvalid={Boolean(nameFieldController.fieldState.error)}
        error={nameFieldController.fieldState.error?.message}
        helpText={
          <EuiText color="subdued" size="xs">
            {Math.max(NAME_MAX_LENGTH - nameField.value.length, 0)} characters{' '}
            {nameField.value.length ? 'left' : 'allowed'}.
            <br />
            Use a unique for the model.
          </EuiText>
        }
      >
        <EuiFieldText
          inputRef={nameInputRef}
          isInvalid={Boolean(nameFieldController.fieldState.error)}
          maxLength={NAME_MAX_LENGTH}
          {...nameField}
          onFocus={handleModelNameFocus}
          onBlur={handleModelNameBlur}
        />
      </EuiFormRow>
      <EuiFormRow
        label="Description"
        isInvalid={Boolean(descriptionFieldController.fieldState.error)}
        error={descriptionFieldController.fieldState.error?.message}
        helpText={`${Math.max(
          DESCRIPTION_MAX_LENGTH - descriptionField.value.length,
          0
        )} characters ${descriptionField.value.length ? 'left' : 'allowed'}.`}
      >
        <EuiTextArea
          inputRef={descriptionInputRef}
          isInvalid={Boolean(descriptionFieldController.fieldState.error)}
          maxLength={DESCRIPTION_MAX_LENGTH}
          {...descriptionField}
        />
      </EuiFormRow>
    </div>
  );
};
