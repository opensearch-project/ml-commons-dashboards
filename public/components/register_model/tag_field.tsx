/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EuiButton,
  EuiComboBox,
  EuiComboBoxOptionOption,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFormRow,
  EuiContext,
} from '@elastic/eui';
import React, { useCallback, useMemo, useRef } from 'react';
import { useController, useWatch, useFormContext } from 'react-hook-form';
import { FORM_ITEM_WIDTH } from './form_constants';
import { ModelFileFormData, ModelUrlFormData } from './register_model.types';

interface ModelTagFieldProps {
  index: number;
  onDelete: (index: number) => void;
  tagKeys: string[];
  tagValues: string[];
  allowKeyCreate?: boolean;
}

const MAX_TAG_LENGTH = 80;

const KEY_COMBOBOX_I18N = {
  mapping: {
    'euiComboBoxOptionsList.noAvailableOptions': 'No keys found. Add a key.',
  },
};

const VALUE_COMBOBOX_I18N = {
  mapping: {
    'euiComboBoxOptionsList.noAvailableOptions': 'No values found. Add a value.',
  },
};

function getComboBoxValue(data: EuiComboBoxOptionOption[]) {
  if (data.length === 0) {
    return '';
  } else {
    return data[0].label;
  }
}

export const ModelTagField = ({
  index,
  tagKeys,
  tagValues,
  allowKeyCreate,
  onDelete,
}: ModelTagFieldProps) => {
  const rowEleRef = useRef<HTMLDivElement>(null);
  const { trigger, control } = useFormContext<ModelFileFormData | ModelUrlFormData>();
  const tags = useWatch({
    control,
    name: 'tags',
  });

  const tagKeyController = useController({
    name: `tags.${index}.key` as const,
    control,
    rules: {
      maxLength: {
        value: MAX_TAG_LENGTH,
        message: '80 characters allowed. Use 80 characters or less.',
      },
      validate: (tagKey) => {
        if (tags) {
          const tag = tags[index];
          // If it has value, key cannot be empty
          if (!tagKey && tag.value) {
            return 'A key is required. Enter a key.';
          }
          // If a tag has key, validate if the same tag key was added before
          if (tagKey) {
            // Find if the same tag key appears before the current tag key
            for (let i = 0; i < index; i++) {
              // If found the same tag key, then the current tag key is invalid
              if (tags[i].key === tagKey) {
                return 'Tag keys must be unique. Use a unique key.';
              }
            }
          }
        }
        return true;
      },
    },
  });

  const tagValueController = useController({
    name: `tags.${index}.value` as const,
    control,
    rules: {
      maxLength: {
        value: MAX_TAG_LENGTH,
        message: '80 characters allowed. Use 80 characters or less.',
      },
      validate: (tagValue) => {
        if (tags) {
          const tag = tags[index];
          // If it has key, value cannot be empty
          if (!tagValue && tag.key) {
            return 'A value is required. Enter a value.';
          }
        }
        return true;
      },
    },
  });

  const onKeyChange = useCallback(
    (data: EuiComboBoxOptionOption[]) => {
      tagKeyController.field.onChange(getComboBoxValue(data));
    },
    [tagKeyController.field]
  );

  const onValueChange = useCallback(
    (data: EuiComboBoxOptionOption[]) => {
      tagValueController.field.onChange(getComboBoxValue(data));
    },
    [tagValueController.field]
  );

  const onKeyCreate = useCallback(
    (value: string) => {
      tagKeyController.field.onChange(value);
    },
    [tagKeyController.field]
  );

  const onValueCreate = useCallback(
    (value: string) => {
      tagValueController.field.onChange(value);
    },
    [tagValueController.field]
  );

  const keyOptions = useMemo(() => {
    return tagKeys
      .filter((key) => !tags?.find((tag) => tag.key === key))
      .map((key) => ({ label: key }));
  }, [tagKeys, tags]);

  const valueOptions = useMemo(() => {
    return tagValues.map((value) => ({ label: value }));
  }, [tagValues]);

  const onBlur = useCallback(
    (e: React.FocusEvent<HTMLDivElement>) => {
      // If the blur event was stolen by the child element of the current row
      // We don't want to validate the form field yet
      if (e.relatedTarget && rowEleRef.current && rowEleRef.current.contains(e.relatedTarget)) {
        return;
      }
      // The blur could happen when selecting combo box dropdown
      // But we don't want to trigger form validation in this case
      if (
        e.relatedTarget?.getAttribute('role') === 'option' &&
        e.relatedTarget?.tagName === 'BUTTON'
      ) {
        return;
      }
      // Validate the form only when the current tag row blurred
      trigger('tags');
    },
    [trigger]
  );

  return (
    <EuiFlexGroup ref={rowEleRef} tabIndex={-1} onBlur={onBlur}>
      <EuiFlexItem grow={false} style={{ width: FORM_ITEM_WIDTH }}>
        <EuiContext i18n={KEY_COMBOBOX_I18N}>
          <EuiFormRow
            label={index === 0 ? 'Key' : ''}
            data-test-subj={`ml-tagKey${index + 1}`}
            isInvalid={Boolean(tagKeyController.fieldState.error)}
            error={tagKeyController.fieldState.error?.message}
          >
            <EuiComboBox
              placeholder="Select or add a key"
              isInvalid={Boolean(tagKeyController.fieldState.error)}
              singleSelection={{ asPlainText: true }}
              options={keyOptions}
              selectedOptions={
                tagKeyController.field.value ? [{ label: tagKeyController.field.value }] : []
              }
              onChange={onKeyChange}
              onCreateOption={allowKeyCreate ? onKeyCreate : undefined}
              customOptionText="Add {searchValue} as a key."
              onBlur={tagKeyController.field.onBlur}
              inputRef={tagKeyController.field.ref}
            />
          </EuiFormRow>
        </EuiContext>
      </EuiFlexItem>
      <EuiFlexItem grow={false} style={{ width: FORM_ITEM_WIDTH }}>
        <EuiContext i18n={VALUE_COMBOBOX_I18N}>
          <EuiFormRow
            label={index === 0 ? 'Value' : ''}
            data-test-subj={`ml-tagValue${index + 1}`}
            isInvalid={Boolean(tagValueController.fieldState.error)}
            error={tagValueController.fieldState.error?.message}
          >
            <EuiComboBox
              placeholder="Select or add a value"
              isInvalid={Boolean(tagValueController.fieldState.error)}
              singleSelection={{ asPlainText: true }}
              options={valueOptions}
              selectedOptions={
                tagValueController.field.value ? [{ label: tagValueController.field.value }] : []
              }
              onChange={onValueChange}
              onCreateOption={onValueCreate}
              customOptionText="Add {searchValue} as a value."
              onBlur={tagValueController.field.onBlur}
              inputRef={tagValueController.field.ref}
            />
          </EuiFormRow>
        </EuiContext>
      </EuiFlexItem>
      <EuiFlexItem grow={false} style={index === 0 ? { transform: 'translateY(22px)' } : undefined}>
        <EuiButton aria-label={`Remove tag at row ${index + 1}`} onClick={() => onDelete(index)}>
          Remove
        </EuiButton>
      </EuiFlexItem>
    </EuiFlexGroup>
  );
};
