/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiHorizontalRule,
  EuiPanel,
  EuiSpacer,
  EuiTitle,
  EuiButton,
  EuiText,
} from '@elastic/eui';
import React, { useState, useCallback } from 'react';
import { useFormContext, useFormState } from 'react-hook-form';
import { ModelVersionNotesField } from '../common/forms/model_version_notes_field';
import { ModelFileFormData, ModelUrlFormData } from './types';

export const ModelVersionInformation = () => {
  const form = useFormContext<ModelFileFormData | ModelUrlFormData>();
  const formState = useFormState({ control: form.control });
  const [readOnly, setReadOnly] = useState(true);

  const onCancel = useCallback(() => {
    form.resetField('versionNotes');
    setReadOnly(true);
  }, [form]);

  // Whether edit button is disabled or not
  // The edit button should be disabled if there were changes in other form fields
  const isEditDisabled = formState.isDirty && !formState.dirtyFields.versionNotes;

  return (
    <EuiPanel style={{ padding: 20 }}>
      <EuiFlexGroup alignItems="center">
        <EuiFlexItem>
          <EuiTitle size="s">
            <h3>Version Information</h3>
          </EuiTitle>
        </EuiFlexItem>
        <EuiFlexItem style={{ marginLeft: 'auto', flexGrow: 0 }}>
          {readOnly ? (
            <EuiButton
              aria-label="edit version notes"
              disabled={isEditDisabled}
              onClick={() => setReadOnly(false)}
            >
              Edit
            </EuiButton>
          ) : (
            <EuiButton aria-label="cancel edit version notes" onClick={onCancel}>
              Cancel
            </EuiButton>
          )}
        </EuiFlexItem>
      </EuiFlexGroup>
      <EuiSpacer size="m" />
      <EuiHorizontalRule margin="none" />
      <EuiSpacer size="m" />
      <EuiFlexGroup>
        <EuiFlexItem style={{ maxWidth: 372 }}>
          <EuiText>
            <h4>
              Version notes - <i style={{ fontWeight: 'normal' }}>optional</i>
            </h4>
            <small>{"Describe what's new about this version."}</small>
          </EuiText>
        </EuiFlexItem>
        <EuiFlexItem>
          <ModelVersionNotesField
            readOnly={readOnly}
            label="Version notes"
            control={form.control}
          />
        </EuiFlexItem>
      </EuiFlexGroup>
    </EuiPanel>
  );
};
