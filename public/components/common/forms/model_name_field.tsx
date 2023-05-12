/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useRef } from 'react';
import { EuiFieldText, EuiFormRow, EuiText } from '@elastic/eui';
import { Control, FieldPathByValue, UseFormTrigger, useController } from 'react-hook-form';

import { APIProvider } from '../../../apis/api_provider';

export const MODEL_NAME_FIELD_DUPLICATE_NAME_ERROR = 'duplicateName';

const NAME_MAX_LENGTH = 80;

interface ModelNameFormData {
  name: string;
}

interface ModelNameFieldProps<TFieldValues extends ModelNameFormData> {
  control: Control<TFieldValues>;
  trigger: UseFormTrigger<TFieldValues>;
}

const isDuplicateModelName = async (name: string) => {
  const searchResult = await APIProvider.getAPI('model').search({
    name,
    from: 0,
    size: 1,
  });
  return searchResult.total_models >= 1;
};

export const ModelNameField = <TFieldValues extends ModelNameFormData>({
  control,
  trigger,
}: ModelNameFieldProps<TFieldValues>) => {
  const modelNameFocusedRef = useRef(false);
  const nameFieldController = useController({
    name: 'name' as FieldPathByValue<TFieldValues, string>,
    control,
    rules: {
      required: { value: true, message: 'Name can not be empty' },
      validate: {
        [MODEL_NAME_FIELD_DUPLICATE_NAME_ERROR]: async (name) => {
          return !modelNameFocusedRef.current && !!name && (await isDuplicateModelName(name))
            ? 'This name is already in use. Use a unique name for the model.'
            : undefined;
        },
      },
    },
  });

  const { ref: nameInputRef, ...nameField } = nameFieldController.field;

  const handleModelNameFocus = useCallback(() => {
    modelNameFocusedRef.current = true;
  }, []);

  const handleModelNameBlur = useCallback(() => {
    nameField.onBlur();
    modelNameFocusedRef.current = false;
    trigger('name' as FieldPathByValue<TFieldValues, string>);
  }, [nameField, trigger]);

  return (
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
  );
};
