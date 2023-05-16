/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useMemo } from 'react';
import {
  EuiButtonIcon,
  EuiComboBox,
  EuiComboBoxOptionOption,
  EuiContext,
  EuiFieldText,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFormRow,
  EuiText,
  EuiToken,
} from '@elastic/eui';
import { Control, useController, useWatch } from 'react-hook-form';

import { TagKeyFormData } from '../types';
import { TagKey, tagKeyTypeOptions } from '../../common';

const FORM_ITEM_WIDTH = 400;

const MAX_TAG_LENGTH = 80;

const KEY_COMBOBOX_I18N = {
  mapping: {
    'euiComboBoxOptionsList.noAvailableOptions': 'No keys found. Add a key.',
  },
};

const singleSelection = { asPlainText: true };

interface ModelTagKeyFieldProps {
  control: Control<TagKeyFormData>;
  index: number;
  onRemove: (index: number) => void;
  allTagKeys: TagKey[];
  savedTagKeys: TagKey[];
  showLabel: boolean;
}

export const ModelTagKeyField = ({
  control,
  index,
  onRemove,
  allTagKeys,
  showLabel,
  savedTagKeys,
}: ModelTagKeyFieldProps) => {
  const tagKeysInForm = useWatch({
    name: 'tagKeys',
    control,
  });
  const nameController = useController({
    name: `tagKeys.${index}.name`,
    control,
    rules: {
      maxLength: {
        value: MAX_TAG_LENGTH,
        message: '80 characters allowed. Use 80 characters or less.',
      },
      validate: (tagKey) => {
        if (tagKeysInForm) {
          // If a tag has key, validate if the same tag key was added before
          if (tagKey) {
            // Find if tag key already exists in saved tag key list, this is a rare case may caused by the saved tag keys updated
            for (let i = 0; i < savedTagKeys.length; i++) {
              if (savedTagKeys[i].name === tagKey) {
                return 'Tag keys must be unique. Use a unique key.';
              }
            }
            // Find if the same tag key appears before the current tag key
            for (let i = 0; i < index; i++) {
              // If found the same tag key, then the current tag key is invalid
              if (tagKeysInForm[i].name === tagKey) {
                return 'Tag keys must be unique. Use a unique key.';
              }
            }
          }
        }
        return true;
      },
    },
  });

  const typeController = useController({
    name: `tagKeys.${index}.type`,
    control,
  });

  const { ref: nameFieldRef, ...restNameFieldProps } = nameController.field;
  const { ref: typeFieldRef, ...restTypeFieldProps } = typeController.field;

  const keyOptions = useMemo(() => {
    const savedTagKeyMap = savedTagKeys.reduce<{ [key: string]: boolean }>(
      (pValue, cValue) => ({
        ...pValue,
        [`${cValue.name}${cValue.type}`]: true,
      }),
      {}
    );
    return allTagKeys.map((item) => ({
      label: item.name,
      value: item,
      disabled: savedTagKeyMap[`${item.name}${item.type}`],
    }));
  }, [allTagKeys, savedTagKeys]);

  const keySelectedOptions = useMemo(
    () => (nameController.field.value ? [{ label: nameController.field.value }] : []),
    [nameController.field.value]
  );

  const typeSelectedOptions = useMemo(() => {
    const option = tagKeyTypeOptions.find((item) => item.value === typeController.field.value);
    return option && nameController.field.value ? [option] : [];
  }, [typeController.field.value, nameController.field.value]);

  const isUsingSystemExistsTagKey = useMemo(() => {
    return allTagKeys.findIndex((item) => item.name === nameController.field.value) !== -1;
  }, [allTagKeys, nameController.field.value]);

  const handleRemoveClick = useCallback(() => {
    onRemove(index);
  }, [index, onRemove]);

  const handleNameKeyCreate = useCallback(
    (value: string) => {
      nameController.field.onChange(value);
      typeController.field.onChange('string');
    },
    [nameController.field, typeController.field]
  );

  const handleNameChange = useCallback(
    (data: Array<EuiComboBoxOptionOption<TagKey>>) => {
      if (data[0]) {
        nameController.field.onChange(data[0].label);
        typeController.field.onChange(data[0].value?.type);
      } else {
        nameController.field.onChange('');
        typeController.field.onChange('string');
      }
    },
    [nameController.field, typeController.field]
  );

  const handleValueChange = useCallback(
    (data: EuiComboBoxOptionOption[]) => {
      if (data?.[0].value) {
        typeController.field.onChange(data[0].value);
      }
    },
    [typeController.field]
  );

  const renderKeyOption = useCallback(
    (option: EuiComboBoxOptionOption<TagKey>, _searchValue: string, contentClassName: string) => {
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

  return (
    <EuiFlexGroup gutterSize="m" tabIndex={-1}>
      <EuiFlexItem style={{ width: FORM_ITEM_WIDTH }}>
        <EuiContext i18n={KEY_COMBOBOX_I18N}>
          <EuiFormRow
            label={showLabel ? 'Key' : ''}
            data-test-subj={`modelTagKeyName${index + 1}`}
            isInvalid={Boolean(nameController.fieldState.error)}
            error={nameController.fieldState.error?.message}
          >
            <EuiComboBox<TagKey>
              placeholder="Select or add a key"
              isInvalid={Boolean(nameController.fieldState.error)}
              singleSelection={singleSelection}
              options={keyOptions}
              renderOption={renderKeyOption}
              selectedOptions={keySelectedOptions}
              onCreateOption={handleNameKeyCreate}
              customOptionText="Add {searchValue} as a key."
              inputRef={nameFieldRef}
              {...restNameFieldProps}
              onChange={handleNameChange}
            />
          </EuiFormRow>
        </EuiContext>
      </EuiFlexItem>
      <EuiFlexItem style={{ width: FORM_ITEM_WIDTH }}>
        <EuiFormRow
          label={showLabel ? 'Type' : ''}
          data-test-subj={`modelTagKeyType${index + 1}`}
          isInvalid={Boolean(typeController.fieldState.error)}
          error={typeController.fieldState.error?.message}
        >
          {isUsingSystemExistsTagKey ? (
            <EuiFieldText
              readOnly
              value={
                tagKeyTypeOptions.find((item) => item.value === restTypeFieldProps.value)?.label
              }
            />
          ) : (
            <EuiComboBox
              placeholder="Select a type"
              isInvalid={Boolean(typeController.fieldState.error)}
              singleSelection={singleSelection}
              options={tagKeyTypeOptions}
              selectedOptions={typeSelectedOptions}
              inputRef={typeFieldRef}
              isDisabled={!nameController.field.value}
              {...restTypeFieldProps}
              onChange={handleValueChange}
              isClearable={false}
            />
          )}
        </EuiFormRow>
      </EuiFlexItem>
      <EuiFlexItem grow={false} style={showLabel ? { transform: 'translateY(22px)' } : undefined}>
        <EuiButtonIcon
          size="m"
          iconType="trash"
          color="danger"
          aria-label={`Remove tag key at row ${index + 1}`}
          onClick={handleRemoveClick}
        />
      </EuiFlexItem>
    </EuiFlexGroup>
  );
};
