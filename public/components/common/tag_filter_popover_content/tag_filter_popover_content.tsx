/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
  EuiPopoverTitle,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFormRow,
  EuiComboBox,
  EuiComboBoxOptionOption,
  EuiToken,
  EuiText,
  EuiSpacer,
  EuiButtonEmpty,
  EuiButton,
  EuiFieldNumber,
} from '@elastic/eui';
import { TagValueSelector } from './tag_value_selector';

interface TagKey {
  name: string;
  type: 'string' | 'number';
}

export enum TagFilterOperator {
  Is = 'is',
  IsNot = 'is not',
  IsGreaterThan = 'is greater than',
  IsLessThan = 'is less than',
  IsOneOf = 'is one of',
  IsNotOneOf = 'is not one of',
}

export interface TagFilterValue {
  name: string;
  operator: TagFilterOperator;
  value: string | string[] | number;
}

export interface TagFilterPopoverProps {
  tagFilter?: TagFilterValue;
  tagKeys: TagKey[];
  onCancel: () => void;
  onSave: (tagFilter: TagFilterValue) => void;
}

const getValueInput = (
  operator: TagFilterOperator,
  valueType: 'string' | 'number',
  value: string | string[] | number | undefined,
  onChange: (value: string | string[] | number | undefined) => void
) => {
  if (valueType === 'string') {
    return (
      <TagValueSelector
        singleSelection={operator === TagFilterOperator.Is || operator === TagFilterOperator.IsNot}
        value={typeof value === 'number' ? undefined : value}
        onChange={onChange}
      />
    );
  }
  return (
    <EuiFieldNumber
      value={value === undefined ? '' : value}
      onChange={(e) => {
        const newValue = e.currentTarget.value;
        onChange(newValue === '' ? undefined : parseFloat(newValue));
      }}
      fullWidth
      placeholder="Add a value"
    />
  );
};

export const TagFilterPopoverContent = ({
  onSave,
  tagKeys,
  onCancel,
  tagFilter,
}: TagFilterPopoverProps) => {
  const [value, setValue] = useState<string | string[] | number | undefined>(tagFilter?.value);
  const [selectedTagOptions, setSelectedTagOptions] = useState<
    Array<EuiComboBoxOptionOption<TagKey>>
  >(() => {
    if (!tagFilter) {
      return [];
    }
    return [
      {
        label: tagFilter.name,
        value: {
          name: tagFilter.name,
          type: typeof tagFilter.value === 'number' ? 'number' : 'string',
        },
      },
    ];
  });
  const [selectedOperatorOptions, setSelectedOperatorOptions] = useState<
    Array<EuiComboBoxOptionOption<{}>>
  >(() => {
    if (!tagFilter) {
      return [];
    }
    return [
      {
        label: tagFilter.operator,
      },
    ];
  });
  const selectedTag = selectedTagOptions[0]?.value;
  const selectedTagType = selectedTag?.type;

  const tagOptions = useMemo(() => tagKeys.map((item) => ({ label: item.name, value: item })), [
    tagKeys,
  ]);

  const operatorsOptions = useMemo(() => {
    if (!selectedTagType) {
      return [];
    }
    return [
      TagFilterOperator.Is,
      TagFilterOperator.IsNot,
      ...(selectedTagType === 'string'
        ? [TagFilterOperator.IsOneOf, TagFilterOperator.IsNotOneOf]
        : []),
      ...(selectedTagType === 'number'
        ? [TagFilterOperator.IsGreaterThan, TagFilterOperator.IsLessThan]
        : []),
    ].map((label) => ({
      label,
    }));
  }, [selectedTagType]);
  const operator = selectedOperatorOptions[0]?.label as TagFilterOperator;

  const tagKeyOptionRenderer = useCallback(
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

  const handleSave = useCallback(() => {
    if (!selectedTag || !operator || !value) {
      return;
    }
    onSave({ name: selectedTag.name, value, operator });
  }, [selectedTag, value, operator, onSave]);

  return (
    <>
      <EuiPopoverTitle>{tagFilter ? 'EDIT' : 'ADD'} TAG FILTER</EuiPopoverTitle>
      <div style={{ width: 592 }}>
        <EuiFlexGroup gutterSize="s">
          <EuiFlexItem grow={8}>
            <EuiFormRow label={'Field'}>
              <EuiComboBox
                placeholder="Select a tag key"
                isClearable={false}
                options={tagOptions}
                selectedOptions={selectedTagOptions}
                onChange={(e) => {
                  setSelectedTagOptions(e);
                  setSelectedOperatorOptions([]);
                  setValue(undefined);
                }}
                singleSelection={{ asPlainText: true }}
                renderOption={tagKeyOptionRenderer}
              />
            </EuiFormRow>
          </EuiFlexItem>
          <EuiFlexItem grow={4}>
            <EuiFormRow label={'Operator'}>
              <EuiComboBox
                placeholder="Select operator"
                isClearable={false}
                isDisabled={!selectedTagType}
                options={operatorsOptions}
                selectedOptions={selectedOperatorOptions}
                onChange={(e) => {
                  setSelectedOperatorOptions(e);
                  setValue(undefined);
                }}
                singleSelection={{ asPlainText: true }}
              />
            </EuiFormRow>
          </EuiFlexItem>
        </EuiFlexGroup>
        {operator && selectedTagType && (
          <>
            <EuiSpacer size="s" />
            <EuiFormRow fullWidth label="Value">
              {getValueInput(operator, selectedTagType, value, setValue)}
            </EuiFormRow>
          </>
        )}
        <EuiSpacer size="m" />
        <EuiFlexGroup gutterSize="s" justifyContent="flexEnd">
          <EuiFlexItem grow={false}>
            <EuiButtonEmpty data-test-subj="tag-filter-popover-cancel-button" onClick={onCancel}>
              Cancel
            </EuiButtonEmpty>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiButton
              data-test-subj="tag-filter-popover-save-button"
              fill
              disabled={value === undefined || (Array.isArray(value) && value.length === 0)}
              onClick={handleSave}
            >
              Save
            </EuiButton>
          </EuiFlexItem>
        </EuiFlexGroup>
      </div>
    </>
  );
};
