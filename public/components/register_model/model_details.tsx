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
import type { Control } from 'react-hook-form';
import { Controller } from 'react-hook-form';

import { FORM_ITEM_WIDTH } from './form_constants';
import { RegisterModelForm } from './register_model.types';

interface ModelDetailsPanelProps {
  formControl: Control<RegisterModelForm>;
}

export const ModelDetailsPanel: React.FC<ModelDetailsPanelProps> = (props) => {
  return (
    <EuiPanel>
      <EuiTitle size="s">
        <h3>Model Details</h3>
      </EuiTitle>
      <EuiHorizontalRule margin="m" />
      <EuiFlexGroup>
        <EuiFlexItem grow={false} style={{ width: FORM_ITEM_WIDTH }}>
          <EuiFormRow label="Model name">
            <Controller
              name="name"
              control={props.formControl}
              rules={{ required: true }}
              render={({ field, fieldState }) => (
                <EuiFieldText
                  placeholder="Enter a name"
                  isInvalid={Boolean(fieldState.error)}
                  {...field}
                />
              )}
            />
          </EuiFormRow>
        </EuiFlexItem>
        <EuiFlexItem grow={false} style={{ width: 220 }}>
          <EuiFormRow label="Version">
            <Controller
              name="version"
              control={props.formControl}
              rules={{ required: true }}
              render={({ field, fieldState }) => (
                <EuiFieldNumber disabled isInvalid={Boolean(fieldState.error)} {...field} />
              )}
            />
          </EuiFormRow>
        </EuiFlexItem>
      </EuiFlexGroup>
      <EuiFlexGroup>
        <EuiFlexItem grow={false} style={{ width: FORM_ITEM_WIDTH }}>
          <EuiFormRow label="Model description">
            <Controller
              name="description"
              control={props.formControl}
              rules={{ required: true }}
              render={({ field, fieldState }) => (
                <EuiTextArea
                  placeholder="Enter a description"
                  isInvalid={Boolean(fieldState.error)}
                  {...field}
                />
              )}
            />
          </EuiFormRow>
        </EuiFlexItem>
        <EuiFlexItem grow={false} style={{ width: FORM_ITEM_WIDTH }}>
          <EuiFormRow label="Annotations(optional)">
            <Controller
              name="annotations"
              control={props.formControl}
              render={({ field }) => (
                <EuiTextArea placeholder="Enter annotations or version notes" {...field} />
              )}
            />
          </EuiFormRow>
        </EuiFlexItem>
      </EuiFlexGroup>
    </EuiPanel>
  );
};
