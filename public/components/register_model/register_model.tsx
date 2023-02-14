/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useEffect } from 'react';
import { FieldErrors, useForm, FormProvider } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import {
  EuiPageHeader,
  EuiSpacer,
  EuiForm,
  EuiButton,
  EuiPanel,
  EuiText,
  EuiBottomBar,
  EuiFlexGroup,
  EuiFlexItem,
} from '@elastic/eui';
import useObservable from 'react-use/lib/useObservable';
import { from } from 'rxjs';

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
import { useOpenSearchDashboards } from '../../../../../src/plugins/opensearch_dashboards_react/public';

const DEFAULT_VALUES = {
  name: '',
  description: '',
  version: '1',
  configuration: '{}',
  tags: [{ key: '', value: '' }],
};

const FORM_ID = 'mlModelUploadForm';

export const RegisterModelForm = () => {
  const { id: latestVersionId } = useParams<{ id: string | undefined }>();
  const typeParams = useSearchParams().get('type');

  const {
    services: { chrome },
  } = useOpenSearchDashboards();
  const isLocked = useObservable(chrome?.getIsNavDrawerLocked$() ?? from([false]));

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

  const form = useForm<ModelFileFormData | ModelUrlFormData>({
    mode: 'onChange',
    defaultValues: DEFAULT_VALUES,
  });
  const submitModel = useModelUpload();

  const onSubmit = async (data: ModelFileFormData | ModelUrlFormData) => {
    await submitModel(data);
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
        form.setValue('name', name);
        form.setValue('version', newVersion);
        form.setValue('configuration', modelConfig?.all_config ?? '');
      }
    };
    initializeForm();
  }, [latestVersionId, form]);

  const onError = useCallback((errors: FieldErrors<ModelFileFormData | ModelUrlFormData>) => {
    // TODO
    // eslint-disable-next-line no-console
    console.log(errors);
  }, []);

  const errorCount = Object.keys(form.formState.errors).length;

  return (
    <FormProvider {...form}>
      <EuiForm
        id={FORM_ID}
        data-test-subj="mlCommonsPlugin-registerModelForm"
        onSubmit={form.handleSubmit(onSubmit, onError)}
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
              <FormPartial />
              <EuiSpacer size="xl" />
            </React.Fragment>
          ))}
        </EuiPanel>
        <EuiSpacer size="xxl" />
        <EuiSpacer size="xxl" />
        <EuiBottomBar left={isLocked ? '320px' : 0}>
          <EuiFlexGroup justifyContent="flexEnd">
            {errorCount > 0 && (
              <EuiFlexItem
                style={{
                  justifyContent: 'center',
                  marginRight: 'auto',
                }}
                grow={false}
              >
                <EuiText style={{ padding: '0 8px', borderLeft: '4px solid #BD271E' }}>
                  {errorCount} form {errorCount > 1 ? 'errors' : 'error'}
                </EuiText>
              </EuiFlexItem>
            )}
            <EuiFlexItem grow={false}>
              <EuiButton
                form={FORM_ID}
                disabled={form.formState.isSubmitting}
                isLoading={form.formState.isSubmitting}
                type="submit"
                fill
              >
                {latestVersionId ? 'Register version' : 'Register model'}
              </EuiButton>
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiBottomBar>
      </EuiForm>
    </FormProvider>
  );
};
