import {
  EuiButton,
  EuiComboBox,
  EuiComboBoxOptionOption,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFormRow,
} from '@elastic/eui';
import React, { useCallback, useMemo } from 'react';
import { Control, useController } from 'react-hook-form';
import { FORM_ITEM_WIDTH } from './form_constants';

interface ModelTagFieldProps {
  name: string;
  index: number;
  formControl: Control<any>;
  onDelete: (index: number) => void;
  tagKeys: string[];
  tagValues: string[];
}

function getComboBoxValue(data: EuiComboBoxOptionOption[]) {
  if (data.length === 0) {
    return '';
  } else {
    return data[0].label;
  }
}

export const ModelTagField = ({
  name,
  formControl,
  index,
  tagKeys,
  tagValues,
  onDelete,
}: ModelTagFieldProps) => {
  const tagKeyController = useController({
    name: `${name}.${index}.key`,
    control: formControl,
  });

  const tagValueController = useController({
    name: `${name}.${index}.value`,
    control: formControl,
  });

  const onKeyChange = useCallback(
    (data: EuiComboBoxOptionOption[]) => {
      tagKeyController.field.onChange(getComboBoxValue(data));
    },
    [tagKeyController.field.onChange]
  );

  const onValueChange = useCallback(
    (data: EuiComboBoxOptionOption[]) => {
      tagValueController.field.onChange(getComboBoxValue(data));
    },
    [tagValueController.field.onChange]
  );

  const keyOptions = useMemo(() => {
    return tagKeys.map((key) => ({ label: key }));
  }, [tagKeys]);

  const valueOptions = useMemo(() => {
    return tagValues.map((value) => ({ label: value }));
  }, [tagValues]);

  return (
    <EuiFlexGroup>
      <EuiFlexItem grow={false} style={{ width: FORM_ITEM_WIDTH }}>
        <EuiFormRow label={index === 0 ? 'Key' : ''}>
          <EuiComboBox
            placeholder="Select or add a key"
            singleSelection={{ asPlainText: true }}
            options={keyOptions}
            selectedOptions={
              tagKeyController.field.value ? [{ label: tagKeyController.field.value }] : []
            }
            onChange={onKeyChange}
            onCreateOption={tagKeyController.field.onChange}
            customOptionText="Add {searchValue} as new tag key"
            onBlur={tagKeyController.field.onBlur}
            inputRef={tagKeyController.field.ref}
          />
        </EuiFormRow>
      </EuiFlexItem>
      <EuiFlexItem grow={false} style={{ width: FORM_ITEM_WIDTH }}>
        <EuiFormRow label={index === 0 ? 'Value' : ''}>
          <EuiComboBox
            placeholder="Select or add a value"
            singleSelection={{ asPlainText: true }}
            options={valueOptions}
            selectedOptions={
              tagValueController.field.value ? [{ label: tagValueController.field.value }] : []
            }
            onChange={onValueChange}
            onCreateOption={tagValueController.field.onChange}
            customOptionText="Add {searchValue} as new tag name"
            onBlur={tagValueController.field.onBlur}
            inputRef={tagValueController.field.ref}
          />
        </EuiFormRow>
      </EuiFlexItem>
      <EuiFlexItem grow={false} style={{ alignSelf: index === 0 ? 'flex-end' : 'auto' }}>
        <EuiButton aria-label={`Remove tag at row ${index + 1}`} onClick={() => onDelete(index)}>
          Remove
        </EuiButton>
      </EuiFlexItem>
    </EuiFlexGroup>
  );
};
