/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useEffect } from 'react';
import { FieldErrors, useForm } from 'react-hook-form';
import { EuiPageHeader, EuiSpacer, EuiForm, EuiButton } from '@elastic/eui';
import { useParams } from 'react-router-dom';

import { APIProvider } from '../../apis/api_provider';
import { upgradeModelVersion } from '../../utils';

import { ModelDetailsPanel } from './model_details';
import type { ModelFileFormData, ModelUrlFormData } from './register_model.types';
import { ArtifactPanel } from './artifact';
import { ConfigurationPanel } from './model_configuration';
import { EvaluationMetricsPanel } from './evaluation_metrics';
import { ModelTagsPanel } from './model_tags';
import { useModelUpload } from './register_model.hooks';

export interface RegisterModelFormProps {
  onSubmit?: (data: ModelFileFormData | ModelUrlFormData) => void;
}

export const RegisterModelForm = (props: RegisterModelFormProps) => {
  const { id: latestVersionId } = useParams<{ id: string | undefined }>();
  const { handleSubmit, control, setValue, formState } = useForm<
    ModelFileFormData | ModelUrlFormData
  >({
    defaultValues: {
      name: '',
      description: '',
      version: '1',
      configuration: '{}',
      tags: [{ key: '', value: '' }],
    },
  });
  const submitModel = useModelUpload();

  const onSubmit = async (data: ModelFileFormData | ModelUrlFormData) => {
    if (props.onSubmit) {
      props.onSubmit(data);
    }
    await submitModel(data);
    // TODO
    // eslint-disable-next-line no-console
    console.log(data);
  };

  useEffect(() => {
    if (!latestVersionId) return;
    const initializeForm = async () => {
      const { data } = await APIProvider.getAPI('model').search({
        ids: [latestVersionId],
        from: 0,
        size: 1,
      });
      if (data?.[0]) {
        // TODO:  clarify which fields to pre-populate
        const { model_version: modelVersion, name, model_config: modelConfig } = data?.[0];
        const newVersion = upgradeModelVersion(modelVersion);
        setValue('name', name);
        setValue('version', newVersion);
        setValue('configuration', modelConfig?.all_config ?? '');
      }
    };
    initializeForm();
  }, [latestVersionId, setValue]);

  const onError = useCallback((errors: FieldErrors<ModelFileFormData | ModelUrlFormData>) => {
    // TODO
    // eslint-disable-next-line no-console
    console.log(errors);
  }, []);

  return (
    <EuiForm
      data-test-subj="mlCommonsPlugin-registerModelForm"
      onSubmit={handleSubmit(onSubmit, onError)}
      component="form"
    >
      <EuiPageHeader pageTitle="Register Model" />
      <EuiSpacer />
      <ModelDetailsPanel formControl={control} />
      <EuiSpacer />
      <ArtifactPanel formControl={control} />
      <EuiSpacer />
      <ConfigurationPanel formControl={control} />
      <EuiSpacer />
      <EvaluationMetricsPanel formControl={control} />
      <EuiSpacer />
      <ModelTagsPanel formControl={control} />
      <EuiSpacer />
      <EuiButton
        disabled={formState.isSubmitting}
        isLoading={formState.isSubmitting}
        type="submit"
        fill
      >
        Register model
      </EuiButton>
    </EuiForm>
  );
};
