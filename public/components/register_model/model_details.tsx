import React from 'react';
import {
  EuiFieldText,
  EuiFieldNumber,
  EuiFlexItem,
  EuiFormRow,
  EuiPanel,
  EuiTitle,
  EuiHorizontalRule,
  EuiFlexGroup,
  EuiTextArea,
} from '@elastic/eui';
import { useController } from 'react-hook-form';
import type { Control } from 'react-hook-form';

import { FORM_ITEM_WIDTH } from './form_constants';
import type { ModelFileFormData, ModelUrlFormData } from './register_model.types';

export const ModelDetailsPanel = (props: {
  formControl: Control<ModelFileFormData | ModelUrlFormData>;
}) => {
  const nameFieldController = useController({
    name: 'name',
    control: props.formControl,
    rules: { required: true },
  });

  const versionFieldController = useController({
    name: 'version',
    control: props.formControl,
    rules: { required: true },
  });

  const descriptionFieldController = useController({
    name: 'description',
    control: props.formControl,
    rules: { required: true },
  });

  const annotationsFieldController = useController({
    name: 'annotations',
    control: props.formControl,
  });

  const { ref: nameInputRef, ...nameField } = nameFieldController.field;
  const { ref: versionInputRef, ...versionField } = versionFieldController.field;
  const { ref: descriptionInputRef, ...descriptionField } = descriptionFieldController.field;
  const { ref: annotationsInputRef, ...annotationsField } = annotationsFieldController.field;

  return (
    <EuiPanel>
      <EuiTitle size="s">
        <h3>Model Details</h3>
      </EuiTitle>
      <EuiHorizontalRule margin="m" />
      <EuiFlexGroup>
        <EuiFlexItem grow={false} style={{ width: FORM_ITEM_WIDTH }}>
          <EuiFormRow label="Model name" isInvalid={Boolean(nameFieldController.fieldState.error)}>
            <EuiFieldText
              inputRef={nameInputRef}
              placeholder="Enter a name"
              isInvalid={Boolean(nameFieldController.fieldState.error)}
              {...nameField}
            />
          </EuiFormRow>
        </EuiFlexItem>
        <EuiFlexItem grow={false} style={{ width: 220 }}>
          <EuiFormRow label="Version" isInvalid={Boolean(versionFieldController.fieldState.error)}>
            <EuiFieldNumber
              inputRef={versionInputRef}
              disabled
              isInvalid={Boolean(versionFieldController.fieldState.error)}
              {...versionField}
            />
          </EuiFormRow>
        </EuiFlexItem>
      </EuiFlexGroup>
      <EuiFlexGroup>
        <EuiFlexItem grow={false} style={{ width: FORM_ITEM_WIDTH }}>
          <EuiFormRow
            label="Model description"
            isInvalid={Boolean(descriptionFieldController.fieldState.error)}
          >
            <EuiTextArea
              inputRef={descriptionInputRef}
              placeholder="Enter a description"
              isInvalid={Boolean(descriptionFieldController.fieldState.error)}
              {...descriptionField}
            />
          </EuiFormRow>
        </EuiFlexItem>
        <EuiFlexItem grow={false} style={{ width: FORM_ITEM_WIDTH }}>
          <EuiFormRow label="Annotations(optional)">
            <EuiTextArea
              inputRef={annotationsInputRef}
              placeholder="Enter annotations or version notes"
              {...annotationsField}
            />
          </EuiFormRow>
        </EuiFlexItem>
      </EuiFlexGroup>
    </EuiPanel>
  );
};
