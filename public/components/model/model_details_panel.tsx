/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import {
  EuiButton,
  EuiDescribedFormGroup,
  EuiFlexGroup,
  EuiFlexItem,
  EuiForm,
  EuiHorizontalRule,
  EuiLink,
  EuiPanel,
  EuiSpacer,
  EuiText,
  EuiTitle,
  htmlIdGenerator,
} from '@elastic/eui';
import { useForm } from 'react-hook-form';
import { generatePath, useHistory } from 'react-router-dom';

import { useOpenSearchDashboards } from '../../../../../src/plugins/opensearch_dashboards_react/public';
import { mountReactNode } from '../../../../../src/core/public/utils';
import { routerPaths } from '../../../common';
import { ErrorCallOut, ModelDescriptionField, ModelNameField } from '../common';

import { BottomFormActionBar } from './bottom_form_action_bar';
import { MODEL_NAME_FIELD_DUPLICATE_NAME_ERROR } from '../common/forms/form_constants';

const formErrorMessages = [
  {
    field: 'name',
    type: 'required',
    message: 'Name: Enter a name.',
  },
  {
    field: 'name',
    type: MODEL_NAME_FIELD_DUPLICATE_NAME_ERROR,
    message: 'Name: Use a unique name.',
  },
];

interface ModelDetailsProps {
  id: string;
  name?: string;
  description?: string;
  onDetailsUpdate?: (formData: { name: string; description?: string }) => void;
}

export const ModelDetailsPanel = ({
  id,
  name,
  description,
  onDetailsUpdate,
}: ModelDetailsProps) => {
  const formIdRef = useRef(htmlIdGenerator()());
  const history = useHistory();
  const { control, resetField, formState, handleSubmit, trigger } = useForm({
    mode: 'onChange',
    defaultValues: {
      name: '',
      description: '',
    },
  });
  const [isEditMode, setIsEditMode] = useState(false);
  const {
    services: { notifications },
  } = useOpenSearchDashboards();

  // formState.errors won't change after formState updated, need to update errors object manually
  const formErrors = useMemo(() => ({ ...formState.errors }), [formState]);

  const handleFormSubmit = useMemo(
    () =>
      handleSubmit(async (formData) => {
        // TODO: Just for mock form submit, need to use model update API after integrated
        await new Promise((resolve) => {
          window.setTimeout(resolve, 1000);
        });
        notifications?.toasts.addSuccess({
          title: mountReactNode(
            <EuiText>
              Updated{' '}
              <EuiLink
                onClick={() => {
                  history.push(
                    generatePath(routerPaths.model, {
                      id,
                    })
                  );
                }}
              >
                {formData.name}
              </EuiLink>
            </EuiText>
          ),
        });
        setIsEditMode(false);
        onDetailsUpdate?.(formData);
        resetField('name', { defaultValue: formData.name || '' });
        resetField('description', { defaultValue: formData.description || '' });
      }),
    [id, history, notifications, resetField, handleSubmit, setIsEditMode, onDetailsUpdate]
  );

  const resetAllFields = useCallback(() => {
    resetField('name', { defaultValue: name || '' });
    resetField('description', { defaultValue: description || '' });
  }, [name, description, resetField]);

  const handleEditClick = useCallback(() => {
    setIsEditMode(true);
  }, []);

  const handleCancelClick = useCallback(() => {
    resetAllFields();
    setIsEditMode(false);
  }, [resetAllFields]);

  useEffect(() => {
    resetField('name', { defaultValue: name || '' });
    resetField('description', { defaultValue: description || '' });
  }, [name, description, resetField]);

  return (
    <EuiPanel style={{ padding: 20 }}>
      <EuiFlexGroup alignItems="center" justifyContent="spaceBetween">
        <EuiFlexItem>
          <EuiTitle size="s">
            <h3>Details</h3>
          </EuiTitle>
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiButton onClick={isEditMode ? handleCancelClick : handleEditClick}>
            {isEditMode ? 'Cancel' : 'Edit'}
          </EuiButton>
        </EuiFlexItem>
      </EuiFlexGroup>
      <EuiSpacer size="m" />
      <EuiHorizontalRule margin="none" />
      <EuiSpacer size="m" />
      {formState.isSubmitted && (
        <>
          <ErrorCallOut formErrors={formErrors} errorMessages={formErrorMessages} />
          <EuiSpacer size="l" />
        </>
      )}
      <EuiForm component="form" id={formIdRef.current} onSubmit={handleFormSubmit}>
        <EuiDescribedFormGroup title={<h4>Name</h4>}>
          <ModelNameField
            control={control}
            trigger={trigger}
            readOnly={!isEditMode}
            originalModelName={name}
          />
        </EuiDescribedFormGroup>
        <EuiDescribedFormGroup
          title={
            <h4>
              Description <i style={{ fontWeight: 400 }}> - optional</i>
            </h4>
          }
          description="Describe the model."
        >
          <ModelDescriptionField control={control} readOnly={!isEditMode} />
        </EuiDescribedFormGroup>
        {(formState.dirtyFields.name || formState.dirtyFields.description) && (
          <BottomFormActionBar
            unSavedChangeCount={Object.keys(formState.dirtyFields).length}
            errorCount={Object.keys(formState.errors).length}
            formId={formIdRef.current}
            onDiscardButtonClick={resetAllFields}
            isSaveButtonDisabled={formState.isSubmitting}
            isSaveButtonLoading={formState.isSubmitting}
          />
        )}
      </EuiForm>
    </EuiPanel>
  );
};
