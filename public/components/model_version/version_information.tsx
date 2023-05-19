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
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useFormContext, useFormState } from 'react-hook-form';
import { ModelVersionNotesField } from '../common/forms/model_version_notes_field';
import { ModelFileFormData, ModelUrlFormData } from './types';

export const ModelVersionInformation = () => {
  const form = useFormContext<ModelFileFormData | ModelUrlFormData>();
  // Returned formState is wrapped with Proxy to improve render performance and
  // skip extra computation if specific state is not subscribed, so make sure you
  // deconstruct or read it before render in order to enable the subscription.
  const { isDirty, dirtyFields } = useFormState({ control: form.control });
  const [readOnly, setReadOnly] = useState(true);
  const formRef = useRef(form);
  formRef.current = form;

  const onCancel = useCallback(() => {
    formRef.current.resetField('versionNotes');
    setReadOnly(true);
  }, []);

  useEffect(() => {
    // reset form value to default when component unmounted, this makes sure
    // the unsaved changes are dropped when the component unmounted
    return () => {
      formRef.current.resetField('versionNotes');
    };
  }, []);

  // Whether edit button is disabled or not
  // The edit button should be disabled if there were changes in other form fields
  const isEditDisabled = isDirty && !dirtyFields.versionNotes;

  return (
    <EuiPanel data-test-subj="ml-versionInformationPanel" style={{ padding: 20 }}>
      <EuiFlexGroup alignItems="center">
        <EuiFlexItem>
          <EuiTitle size="s">
            <h3>Version Information</h3>
          </EuiTitle>
        </EuiFlexItem>
        <EuiFlexItem style={{ marginLeft: 'auto', flexGrow: 0 }}>
          {readOnly || isEditDisabled ? (
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
        <EuiFlexItem style={{ minWidth: 372, flexGrow: 0 }}>
          <EuiText>
            <h4>
              Version notes - <i style={{ fontWeight: 'normal' }}>optional</i>
            </h4>
            <small>{"Describe what's new about this version."}</small>
          </EuiText>
        </EuiFlexItem>
        <EuiFlexItem>
          <ModelVersionNotesField readOnly={readOnly || isEditDisabled} label="Version notes" />
        </EuiFlexItem>
      </EuiFlexGroup>
    </EuiPanel>
  );
};
