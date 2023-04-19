/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EuiComboBox,
  EuiComboBoxOptionOption,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFormRow,
  EuiContext,
  EuiButtonIcon,
  EuiFieldNumber,
  EuiText,
  EuiToken,
  EuiToolTip,
} from '@elastic/eui';
import React, { useCallback, useMemo, useRef } from 'react';
import { useController, useWatch, useFormContext } from 'react-hook-form';
import { FORM_ITEM_WIDTH } from './form_constants';
import { ModelFileFormData, ModelUrlFormData } from './register_model.types';
import { TagTypePopover } from './tag_type_popover';

interface TagGroup {
  name: string;
  type: 'string' | 'number';
  values: string[] | number[];
}

interface ModelTagFieldProps {
  index: number;
  onDelete: (index: number) => void;
  allowKeyCreate?: boolean;
  tagGroups: TagGroup[];
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

function getComboBoxValue(data: Array<EuiComboBoxOptionOption<TagGroup>>) {
  if (data.length === 0) {
    return '';
  } else {
    return data[0].label;
  }
}

export const ModelTagField = ({
  index,
  tagGroups,
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

  const selectedTagGroup = useMemo(
    () => tagGroups.find((t) => t.name === tagKeyController.field.value),
    [tagGroups, tagKeyController]
  );

  const tagTypeController = useController({
    name: `tags.${index}.type` as const,
    control,
  });

  const onKeyChange = useCallback(
    (data: Array<EuiComboBoxOptionOption<TagGroup>>) => {
      const tagKey = getComboBoxValue(data);
      tagKeyController.field.onChange(tagKey);

      // update tag type if selected an existed tag
      const tagGroup = tagGroups.find((t) => t.name === tagKey);
      if (tagGroup) {
        tagTypeController.field.onChange(tagGroup.type);
      }
    },
    [tagKeyController.field, tagTypeController.field, tagGroups]
  );

  const onStringValueChange = useCallback(
    (data: Array<EuiComboBoxOptionOption<TagGroup>>) => {
      tagValueController.field.onChange(getComboBoxValue(data));
    },
    [tagValueController.field]
  );

  const onNumberValueChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      tagValueController.field.onChange(e.target.value);
    },
    [tagValueController.field]
  );

  const onApplyType = useCallback(
    (type: 'number' | 'string') => {
      tagTypeController.field.onChange(type);
    },
    [tagTypeController.field]
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
    return tagGroups
      .filter((group) => !tags?.find((tag) => tag.key === group.name))
      .map((group) => ({ label: group.name, value: group }));
  }, [tagGroups, tags]);

  const valueOptions = useMemo(() => {
    if (selectedTagGroup) {
      return selectedTagGroup.values.map((v) => ({ label: `${v}` }));
    }
    return [];
  }, [selectedTagGroup]);

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

  const renderOption = useCallback(
    (option: EuiComboBoxOptionOption<TagGroup>, searchValue: string, contentClassName: string) => {
      return (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <EuiToken
            style={{ marginRight: 2 }}
            iconType={option.value?.type === 'number' ? 'tokenNumber' : 'tokenString'}
          />
          <span className={contentClassName}>{option.label}</span>
          <EuiText style={{ marginLeft: 'auto' }} color="subdued" size="s">
            {option.value?.type}
          </EuiText>
        </div>
      );
    },
    []
  );

  const onRemove = useCallback(
    (idx: number) => {
      if (tags?.length && tags.length > 1) {
        onDelete(idx);
      } else {
        tagValueController.field.onChange('');
        tagKeyController.field.onChange('');
      }
    },
    [tags, onDelete, tagKeyController.field, tagValueController.field]
  );

  return (
    <EuiFlexGroup gutterSize="m" ref={rowEleRef} tabIndex={-1} onBlur={onBlur}>
      <EuiFlexItem grow={false} style={{ width: FORM_ITEM_WIDTH }}>
        <EuiContext i18n={KEY_COMBOBOX_I18N}>
          <EuiFormRow
            label={index === 0 ? 'Key' : ''}
            data-test-subj={`ml-tagKey${index + 1}`}
            isInvalid={Boolean(tagKeyController.fieldState.error)}
            error={tagKeyController.fieldState.error?.message}
          >
            <EuiComboBox<TagGroup>
              placeholder="Select or add a key"
              isInvalid={Boolean(tagKeyController.fieldState.error)}
              singleSelection={{ asPlainText: true }}
              options={keyOptions}
              renderOption={renderOption}
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
            {tagTypeController.field.value === 'string' ? (
              <EuiComboBox
                prepend={
                  selectedTagGroup || !tagKeyController.field.value ? (
                    'String'
                  ) : (
                    <TagTypePopover value={tagTypeController.field.value} onApply={onApplyType} />
                  )
                }
                placeholder="Select or add a value"
                isInvalid={Boolean(tagValueController.fieldState.error)}
                singleSelection={{ asPlainText: true }}
                options={valueOptions}
                selectedOptions={
                  tagValueController.field.value ? [{ label: tagValueController.field.value }] : []
                }
                onChange={onStringValueChange}
                onCreateOption={onValueCreate}
                customOptionText="Add {searchValue} as a value."
                onBlur={tagValueController.field.onBlur}
                inputRef={tagValueController.field.ref}
                isDisabled={!Boolean(tagKeyController.field.value)}
              />
            ) : (
              <EuiFieldNumber
                prepend={
                  selectedTagGroup || !tagKeyController.field.value ? (
                    'Number'
                  ) : (
                    <TagTypePopover value={tagTypeController.field.value} onApply={onApplyType} />
                  )
                }
                placeholder="Add a value"
                value={tagValueController.field.value}
                isInvalid={Boolean(tagValueController.fieldState.error)}
                onChange={onNumberValueChange}
                onBlur={tagValueController.field.onBlur}
                inputRef={tagValueController.field.ref}
                disabled={!Boolean(tagKeyController.field.value)}
              />
            )}
          </EuiFormRow>
        </EuiContext>
      </EuiFlexItem>
      <EuiFlexItem grow={false} style={index === 0 ? { transform: 'translateY(22px)' } : undefined}>
        <EuiToolTip content={tags?.length && tags.length > 1 ? 'Remove' : 'Clear'}>
          <EuiButtonIcon
            display="base"
            size="m"
            iconType="cross"
            aria-label={`Remove tag at row ${index + 1}`}
            onClick={() => onRemove(index)}
          />
        </EuiToolTip>
      </EuiFlexItem>
    </EuiFlexGroup>
  );
};
