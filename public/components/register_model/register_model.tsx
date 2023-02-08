/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useEffect } from 'react';
import { FieldErrors, useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { EuiPageHeader, EuiSpacer, EuiForm, EuiButton, EuiPanel, EuiText } from '@elastic/eui';

import { ModelDetailsPanel } from './model_details';
import type { ModelFileFormData, ModelUrlFormData } from './register_model.types';
import { ArtifactPanel } from './artifact';
import { ConfigurationPanel } from './model_configuration';
import { EvaluationMetricsPanel } from './evaluation_metrics';
import { ModelTagsPanel } from './model_tags';
import { useModelUpload } from './register_model.hooks';
import { APIProvider } from '../../apis/api_provider';
import { upgradeModelVersion } from '../../utils';
import { useSearchParams } from '../../hooks/use_search_params';
import { isValidModelRegisterFormType } from './utils';

export interface RegisterModelFormProps {
  onSubmit?: (data: ModelFileFormData | ModelUrlFormData) => void;
}

const DEFAULT_VALUES = {
  name: '',
  description: '',
  version: '1',
  configuration: '{}',
  tags: [{ key: '', value: '' }],
};

export const RegisterModelForm = (props: RegisterModelFormProps) => {
  const { id: latestVersionId } = useParams<{ id: string | undefined }>();
  const typeParams = useSearchParams().get('type');

  const formType = isValidModelRegisterFormType(typeParams) ? typeParams : 'upload';
  const partials =
    formType === 'import'
      ? [ModelDetailsPanel, ModelTagsPanel]
      : [
          ModelDetailsPanel,
          ArtifactPanel,
          ConfigurationPanel,
          EvaluationMetricsPanel,
          ModelTagsPanel,
        ];

  const { handleSubmit, control, setValue, formState } = useForm<
    ModelFileFormData | ModelUrlFormData
  >({
    mode: 'onChange',
    defaultValues: DEFAULT_VALUES,
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
        currentPage: 1,
        pageSize: 1,
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
      <EuiPanel>
        <EuiPageHeader pageTitle="Register Model" />
        <EuiText style={{ maxWidth: 420 }}>
          <small>
            Register your model to collaboratively manage its life cycle, and facilitate model
            discovery across your organization.
          </small>
        </EuiText>
        <EuiSpacer />
        {partials.map((FormPartial, i) => (
          <React.Fragment key={i}>
            <FormPartial formControl={control} ordinalNumber={i + 1} />
            <EuiSpacer size="xl" />
          </React.Fragment>
        ))}
        <EuiButton
          disabled={formState.isSubmitting}
          isLoading={formState.isSubmitting}
          type="submit"
          fill
        >
          Register model
        </EuiButton>
      </EuiPanel>
    </EuiForm>
  );
};
