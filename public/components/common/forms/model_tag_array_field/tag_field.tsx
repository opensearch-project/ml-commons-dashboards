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
  EuiToolTip,
  EuiFieldText,
} from '@elastic/eui';
import React, { useCallback, useMemo, useRef } from 'react';
import { useController, useWatch, useFormContext, useFormState } from 'react-hook-form';

import { tagKeyOptionRenderer } from '../../../common';
import { Tag } from '../../../model/types';
import { TagTypePopover } from './tag_type_popover';

export interface TagGroup {
  name: string;
  type: 'string' | 'number';
  values: string[] | number[];
}

interface TagFieldProps {
  index: number;
  onDelete: (index: number) => void;
  allowKeyCreate?: boolean;
  tagGroups: TagGroup[];
  readOnly?: boolean;
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

export const TagField = ({
  index,
  tagGroups,
  allowKeyCreate,
  onDelete,
  readOnly,
}: TagFieldProps) => {
  const rowEleRef = useRef<HTMLDivElement>(null);
  const { trigger, control } = useFormContext<{ tags?: Tag[] }>();
  const { defaultValues } = useFormState({ control });
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

  // we don't allow to change tag type and tag key if it is a default tag
  const isDefaultTag = useMemo(() => {
    if (defaultValues && defaultValues.tags) {
      return Boolean(
        defaultValues.tags.find((t) => t?.key && t.key === tagKeyController.field.value)
      );
    }
    return false;
  }, [defaultValues, tagKeyController]);

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

  const createValueField = () => {
    if (readOnly) {
      return <EuiFieldText value={tagValueController.field.value} readOnly />;
    }

    if (tagTypeController.field.value === 'string') {
      const prepend =
        selectedTagGroup || !tagKeyController.field.value ? (
          'String'
        ) : (
          <TagTypePopover value={tagTypeController.field.value} onApply={onApplyType} />
        );

      return (
        <EuiComboBox
          prepend={isDefaultTag ? undefined : prepend}
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
      );
    }

    const prepend =
      selectedTagGroup || !tagKeyController.field.value ? (
        'Number'
      ) : (
        <TagTypePopover value={tagTypeController.field.value} onApply={onApplyType} />
      );

    return (
      <EuiFieldNumber
        prepend={isDefaultTag ? undefined : prepend}
        placeholder="Add a value"
        value={tagValueController.field.value}
        isInvalid={Boolean(tagValueController.fieldState.error)}
        onChange={onNumberValueChange}
        onBlur={tagValueController.field.onBlur}
        inputRef={tagValueController.field.ref}
        disabled={!Boolean(tagKeyController.field.value)}
      />
    );
  };

  return (
    <EuiFlexGroup
      data-test-subj="ml-versionTagRow"
      gutterSize="m"
      ref={rowEleRef}
      tabIndex={-1}
      onBlur={onBlur}
      style={{ marginTop: 4 }}
    >
      <EuiFlexItem style={{ maxWidth: 400 }}>
        <EuiContext i18n={KEY_COMBOBOX_I18N}>
          <EuiFormRow
            label={index === 0 ? 'Key' : ''}
            data-test-subj={`ml-tagKey${index + 1}`}
            isInvalid={Boolean(tagKeyController.fieldState.error)}
            error={tagKeyController.fieldState.error?.message}
          >
            {readOnly || isDefaultTag ? (
              <EuiFieldText value={tagKeyController.field.value} readOnly />
            ) : (
              <EuiComboBox<TagGroup>
                placeholder="Select or add a key"
                isInvalid={Boolean(tagKeyController.fieldState.error)}
                singleSelection={{ asPlainText: true }}
                options={keyOptions}
                renderOption={tagKeyOptionRenderer}
                selectedOptions={
                  tagKeyController.field.value ? [{ label: tagKeyController.field.value }] : []
                }
                onChange={onKeyChange}
                onCreateOption={allowKeyCreate ? onKeyCreate : undefined}
                customOptionText="Add {searchValue} as a key."
                onBlur={tagKeyController.field.onBlur}
                inputRef={tagKeyController.field.ref}
              />
            )}
          </EuiFormRow>
        </EuiContext>
      </EuiFlexItem>
      <EuiFlexItem style={{ maxWidth: 400 }}>
        <EuiContext i18n={VALUE_COMBOBOX_I18N}>
          <EuiFormRow
            label={index === 0 ? 'Value' : ''}
            data-test-subj={`ml-tagValue${index + 1}`}
            isInvalid={Boolean(tagValueController.fieldState.error)}
            error={tagValueController.fieldState.error?.message}
          >
            {createValueField()}
          </EuiFormRow>
        </EuiContext>
      </EuiFlexItem>
      {!readOnly && (
        <EuiFlexItem
          grow={false}
          style={index === 0 ? { transform: 'translateY(22px)' } : undefined}
        >
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
      )}
    </EuiFlexGroup>
  );
};
