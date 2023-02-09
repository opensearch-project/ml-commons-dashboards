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
} from '@elastic/eui';
import React, { useCallback, useMemo, useRef } from 'react';
import { Control, useController, useWatch, useFormContext } from 'react-hook-form';
import { FORM_ITEM_WIDTH } from './form_constants';
import { ModelFileFormData, ModelUrlFormData } from './register_model.types';

interface ModelTagFieldProps {
  index: number;
  formControl: Control<ModelFileFormData | ModelUrlFormData>;
  onDelete: (index: number) => void;
  tagKeys: string[];
  tagValues: string[];
}

const MAX_TAG_SIZE = 80;

function getComboBoxValue(data: EuiComboBoxOptionOption[]) {
  if (data.length === 0) {
    return '';
  } else {
    return data[0].label;
  }
}

export const ModelTagField = ({
  formControl,
  index,
  tagKeys,
  tagValues,
  onDelete,
}: ModelTagFieldProps) => {
  const rowEleRef = useRef<HTMLDivElement>(null);
  const { trigger } = useFormContext<ModelFileFormData | ModelUrlFormData>();
  const tags = useWatch({
    control: formControl,
    name: 'tags',
  });

  const tagKeyController = useController({
    name: `tags.${index}.key` as 'tags.0.key',
    control: formControl,
    rules: {
      validate: (tagKey) => {
        const tag = tags?.[index];
        if (!tagKey && tag?.value) {
          return 'A key is required. Enter a key.';
        }
        if (tags && tag && tag.key && tag.value) {
          for (let i = 0; i < tags.length; i++) {
            // Display error on duplicate tag if the first matching tag is not the current one
            if (tags[i].key === tag.key && tags[i].value === tag.value) {
              if (index !== i) {
                return 'This tag has already been added. Remove the duplicate tag.';
              } else {
                break;
              }
            }
          }
        }
        return true;
      },
    },
  });

  const tagValueController = useController({
    name: `tags.${index}.value` as 'tags.0.value',
    control: formControl,
    rules: {
      validate: (tagValue) => {
        const tag = tags?.[index];
        if (!tagValue && tag?.key) {
          return 'A value is required. Enter a value.';
        }
        if (tags && tag && tag.key && tag.value) {
          for (let i = 0; i < tags.length; i++) {
            // Display error on duplicate tag if the first matching tag is not the current one
            if (tags[i].key === tag.key && tags[i].value === tag.value) {
              if (index !== i) {
                // return `false` because we only show error message on tag `key` field
                return false;
              } else {
                break;
              }
            }
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
      if (value.length > MAX_TAG_SIZE) {
        return;
      }
      tagKeyController.field.onChange(value);
    },
    [tagKeyController.field]
  );

  const onValueCreate = useCallback(
    (value: string) => {
      if (value.length > MAX_TAG_SIZE) {
        return;
      }
      tagValueController.field.onChange(value);
    },
    [tagValueController.field]
  );

  const keyOptions = useMemo(() => {
    return tagKeys.map((key) => ({ label: key }));
  }, [tagKeys]);

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
      trigger(`tags.${index}` as 'tags.0');
    },
    [trigger, index]
  );

  return (
    <EuiFlexGroup ref={rowEleRef} tabIndex={-1} onBlur={onBlur}>
      <EuiFlexItem grow={false} style={{ width: FORM_ITEM_WIDTH }}>
        <EuiFormRow
          label={index === 0 ? 'Key' : ''}
          aria-label={`Tag key ${index + 1}`}
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
            onCreateOption={onKeyCreate}
            customOptionText="Add {searchValue} as new tag key. (80 characters allowed)"
            onBlur={tagKeyController.field.onBlur}
            inputRef={tagKeyController.field.ref}
          />
        </EuiFormRow>
      </EuiFlexItem>
      <EuiFlexItem grow={false} style={{ width: FORM_ITEM_WIDTH }}>
        <EuiFormRow
          label={index === 0 ? 'Value' : ''}
          aria-label={`Tag value ${index + 1}`}
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
            customOptionText="Add {searchValue} as new tag name. (80 characters allowed)"
            onBlur={tagValueController.field.onBlur}
            inputRef={tagValueController.field.ref}
          />
        </EuiFormRow>
      </EuiFlexItem>
      <EuiFlexItem grow={false} style={index === 0 ? { transform: 'translateY(22px)' } : undefined}>
        <EuiButton aria-label={`Remove tag at row ${index + 1}`} onClick={() => onDelete(index)}>
          Remove
        </EuiButton>
      </EuiFlexItem>
    </EuiFlexGroup>
  );
};
