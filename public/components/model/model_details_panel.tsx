/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import {
  EuiButton,
  EuiCallOut,
  EuiDescribedFormGroup,
  EuiFieldText,
  EuiFlexGroup,
  EuiFlexItem,
  EuiForm,
  EuiFormRow,
  EuiHorizontalRule,
  EuiLink,
  EuiPanel,
  EuiSpacer,
  EuiText,
  EuiTextArea,
  EuiTitle,
  htmlIdGenerator,
} from '@elastic/eui';
import { useController, useForm } from 'react-hook-form';
import { generatePath, useHistory } from 'react-router-dom';

import { useOpenSearchDashboards } from '../../../../../src/plugins/opensearch_dashboards_react/public';
import { mountReactNode } from '../../../../../src/core/public/utils';
import { routerPaths } from '../../../common';

import { BottomFormActionBar } from './bottom_form_action_bar';

const NAME_MAX_LENGTH = 80;

const DESCRIPTION_MAX_LENGTH = 200;

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
  const { control, resetField, formState, handleSubmit } = useForm({
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

  const nameController = useController({
    control,
    name: 'name',
    rules: {
      required: { value: true, message: 'Name can not be empty' },
    },
  });
  const { ref: nameInputRef, ...restNameFieldProps } = nameController.field;

  const descriptionController = useController({
    control,
    name: 'description',
  });
  const { ref: descriptionInputRef, ...restDescriptionFieldProps } = descriptionController.field;

  const formErrorCalloutTexts = useMemo(() => {
    const errors = [];
    if (formState.errors.name && formState.errors.name.type === 'required') {
      errors.push('Name: can not be empty');
    }
    return errors;
  }, [formState]);

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
                    generatePath(routerPaths.modelGroup, {
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
      {formState.isSubmitted && formErrorCalloutTexts.length > 0 && (
        <>
          <EuiCallOut
            iconType="alert"
            color="danger"
            title="Address the following error(s) in the form"
          >
            <EuiText size="s">
              <ul style={{ listStyle: 'inside', marginLeft: 6 }}>
                {formErrorCalloutTexts.map((text) => (
                  <li key={text}>{text}</li>
                ))}
              </ul>
            </EuiText>
          </EuiCallOut>
          <EuiSpacer size="l" />
        </>
      )}
      <EuiForm component="form" id={formIdRef.current} onSubmit={handleFormSubmit}>
        <EuiDescribedFormGroup title={<h4>Name</h4>}>
          <EuiFormRow
            helpText={
              isEditMode && (
                <>
                  {`${Math.max(
                    NAME_MAX_LENGTH - (restNameFieldProps.value?.length ?? 0),
                    0
                  )} characters ${restNameFieldProps.value?.length ? 'left' : 'allowed'}.`}
                  <br />
                  Use a unique name for the model.
                </>
              )
            }
            isInvalid={Boolean(nameController.fieldState.error)}
            error={nameController.fieldState.error?.message}
            label="Name"
          >
            <EuiFieldText
              inputRef={nameInputRef}
              aria-label="Name"
              readOnly={!isEditMode}
              maxLength={NAME_MAX_LENGTH}
              {...restNameFieldProps}
            />
          </EuiFormRow>
        </EuiDescribedFormGroup>
        <EuiDescribedFormGroup
          title={
            <h4>
              Description <i style={{ fontWeight: 400 }}> - optional</i>
            </h4>
          }
          description="Describe the model."
        >
          <EuiFormRow
            helpText={
              isEditMode &&
              `${Math.max(
                DESCRIPTION_MAX_LENGTH - (restDescriptionFieldProps.value?.length ?? 0),
                0
              )} characters ${restDescriptionFieldProps.value?.length ? 'left' : 'allowed'}.`
            }
            isInvalid={Boolean(descriptionController.fieldState.error)}
            error={descriptionController.fieldState.error?.message}
            label="Description"
          >
            <EuiTextArea
              aria-label="Description"
              readOnly={!isEditMode}
              maxLength={DESCRIPTION_MAX_LENGTH}
              {...restDescriptionFieldProps}
            />
          </EuiFormRow>
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
