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
import { RegisterModelFormData } from './register_model.types';

interface ModelDetailsPanelProps {
  formControl: Control<RegisterModelFormData>;
}

export const ModelDetailsPanel: React.FC<ModelDetailsPanelProps> = (props) => {
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
              placeholder="Enter a name"
              isInvalid={Boolean(nameFieldController.fieldState.error)}
              {...nameFieldController.field}
            />
          </EuiFormRow>
        </EuiFlexItem>
        <EuiFlexItem grow={false} style={{ width: 220 }}>
          <EuiFormRow label="Version" isInvalid={Boolean(versionFieldController.fieldState.error)}>
            <EuiFieldNumber
              disabled
              isInvalid={Boolean(versionFieldController.fieldState.error)}
              {...versionFieldController.field}
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
              placeholder="Enter a description"
              isInvalid={Boolean(descriptionFieldController.fieldState.error)}
              {...descriptionFieldController.field}
            />
          </EuiFormRow>
        </EuiFlexItem>
        <EuiFlexItem grow={false} style={{ width: FORM_ITEM_WIDTH }}>
          <EuiFormRow label="Annotations(optional)">
            <EuiTextArea
              placeholder="Enter annotations or version notes"
              {...annotationsFieldController.field}
            />
          </EuiFormRow>
        </EuiFlexItem>
      </EuiFlexGroup>
    </EuiPanel>
  );
};
