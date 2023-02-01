/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useEffect } from 'react';
import { FieldErrors, useForm } from 'react-hook-form';
import { EuiPageHeader, EuiSpacer, EuiForm, EuiButton } from '@elastic/eui';
import { useParams } from 'react-router-dom';
import { ModelDetailsPanel } from './model_details';
import type { ModelFileFormData, ModelUrlFormData } from './register_model.types';
import { ArtifactPanel } from './artifact';
import { ConfigurationPanel } from './model_configuration';
import { EvaluationMetricsPanel } from './evaluation_metrics';
import { ModelTagsPanel } from './model_tags';
import { APIProvider } from '../../apis/api_provider';
import { upgradeModelVersion } from '../../utils';

export interface RegisterModelFormProps {
  onSubmit?: (data: ModelFileFormData | ModelUrlFormData) => void;
}

export const RegisterModelForm = (props: RegisterModelFormProps) => {
  const { id: latestVersioinId } = useParams<{ id: string | undefined }>();
  const { handleSubmit, control, setValue } = useForm<ModelFileFormData | ModelUrlFormData>({
    defaultValues: {
      name: '',
      description: '',
      version: '1',
      configuration: '{}',
      tags: [{ key: '', value: '' }],
    },
  });

  const onSubmit = (data: ModelFileFormData | ModelUrlFormData) => {
    if (props.onSubmit) {
      props.onSubmit(data);
    }
    // TODO
    // eslint-disable-next-line no-console
    console.log(data);
  };

  useEffect(() => {
    if (!latestVersioinId) return;
    const fn = async () => {
      const { data } = await APIProvider.getAPI('model').search({
        ids: [latestVersioinId],
        currentPage: 1,
        pageSize: 1,
      });
      if (data?.[0]) {
        //TODO:  clarify which fields to pre-populate
        const { model_version, name, model_config } = data?.[0];
        const newVersion = upgradeModelVersion(model_version);
        setValue('name', name);
        setValue('version', newVersion);
        setValue('configuration', model_config?.all_config ?? '');
      }
    };
    fn();
  }, [latestVersioinId]);

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
      <EuiButton type="submit" fill>
        Register model
      </EuiButton>
    </EuiForm>
  );
};
