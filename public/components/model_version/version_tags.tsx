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
  EuiLink,
} from '@elastic/eui';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useFormContext, useFormState } from 'react-hook-form';
import { ModelTagArrayField } from '../common/forms/model_tag_array_field';
import { useModelTags } from '../register_model/register_model.hooks';
import { ModelVersionFormData } from './types';

export const ModelVersionTags = () => {
  const [, tags] = useModelTags();
  const form = useFormContext<ModelVersionFormData>();
  const { isDirty, dirtyFields } = useFormState({ control: form.control });
  const [readOnly, setReadOnly] = useState(true);
  const formRef = useRef(form);
  formRef.current = form;

  const onCancel = useCallback(() => {
    formRef.current.resetField('tags');
    setReadOnly(true);
  }, []);

  useEffect(() => {
    // reset form value to default when unmount
    return () => {
      formRef.current.resetField('tags');
    };
  }, []);

  const isEditDisabled = isDirty && !dirtyFields.tags;

  return (
    <EuiPanel data-test-subj="ml-versionTagPanel" style={{ padding: 20 }}>
      <EuiFlexGroup alignItems="center">
        <EuiFlexItem>
          <EuiTitle size="s">
            <h3>Tags</h3>
          </EuiTitle>
        </EuiFlexItem>
        <EuiFlexItem style={{ marginLeft: 'auto', flexGrow: 0 }}>
          {readOnly || isEditDisabled ? (
            <EuiButton
              aria-label="edit tags"
              disabled={isEditDisabled}
              onClick={() => setReadOnly(false)}
            >
              Edit
            </EuiButton>
          ) : (
            <EuiButton aria-label="cancel edit tags" onClick={onCancel}>
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
              Tags - <i style={{ fontWeight: 'normal' }}>optional</i>
            </h4>
            <small>
              Tags help your organization discover and compare models, and track information related
              to model versions, such as evaluation metrics.{' '}
              <EuiLink external href="http://todo">
                Learn more
              </EuiLink>
            </small>
          </EuiText>
        </EuiFlexItem>
        <EuiFlexItem>
          <ModelTagArrayField
            allowKeyCreate={false}
            readOnly={readOnly || isEditDisabled}
            tags={tags}
          />
        </EuiFlexItem>
      </EuiFlexGroup>
    </EuiPanel>
  );
};
