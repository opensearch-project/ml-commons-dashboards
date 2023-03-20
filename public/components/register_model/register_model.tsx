/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useEffect, useState } from 'react';
import { FieldErrors, useForm, FormProvider } from 'react-hook-form';
import { generatePath, useHistory, useParams } from 'react-router-dom';
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
  EuiTextColor,
  EuiLink,
  EuiLoadingSpinner,
} from '@elastic/eui';
import useObservable from 'react-use/lib/useObservable';
import { from } from 'rxjs';

import { ModelDetailsPanel } from './model_details';
import type { ModelFileFormData, ModelUrlFormData } from './register_model.types';
import { ArtifactPanel } from './artifact';
import { ConfigurationPanel } from './model_configuration';
import { ModelTagsPanel } from './model_tags';
import { submitModelWithFile, submitModelWithURL } from './register_model_api';
import { APIProvider } from '../../apis/api_provider';
import { upgradeModelVersion } from '../../utils';
import { useSearchParams } from '../../hooks/use_search_params';
import { isValidModelRegisterFormType } from './utils';
import { useOpenSearchDashboards } from '../../../../../src/plugins/opensearch_dashboards_react/public';
import { mountReactNode } from '../../../../../src/core/public/utils';
import { modelFileUploadManager } from './model_file_upload_manager';
import { MAX_CHUNK_SIZE } from './constants';
import { routerPaths } from '../../../common/router_paths';
import { modelTaskManager } from './model_task_manager';
import { ModelVersionNotesPanel } from './model_version_notes';
import { modelRepositoryManager } from '../../utils/model_repository_manager';
import { ErrorCallOut } from './error_call_out';

const DEFAULT_VALUES = {
  name: '',
  description: '',
  version: '1',
  configuration: '',
  tags: [{ key: '', value: '' }],
  modelFileFormat: '',
};

const FORM_ID = 'mlModelUploadForm';

interface RegisterModelFormProps {
  defaultValues?: Partial<ModelFileFormData> | Partial<ModelUrlFormData>;
}

const ModelOverviewTitle = () => {
  return (
    <EuiText size="s">
      <h2>Model overview</h2>
    </EuiText>
  );
};

const FileAndVersionTitle = () => {
  return (
    <EuiText size="s">
      <h2>File and version information</h2>
    </EuiText>
  );
};

export const RegisterModelForm = ({ defaultValues = DEFAULT_VALUES }: RegisterModelFormProps) => {
  const history = useHistory();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { id: latestVersionId } = useParams<{ id: string | undefined }>();
  const [modelGroupName, setModelGroupName] = useState<string>();
  const searchParams = useSearchParams();
  const typeParams = searchParams.get('type');
  const nameParams = searchParams.get('name');

  const {
    services: { chrome, notifications },
  } = useOpenSearchDashboards();
  const isLocked = useObservable(chrome?.getIsNavDrawerLocked$() ?? from([false]));

  const formType = isValidModelRegisterFormType(typeParams) ? typeParams : 'upload';
  const [preTrainedModelLoading, setPreTrainedModelLoading] = useState(formType === 'import');
  const partials =
    formType === 'import'
      ? [ModelDetailsPanel, ModelTagsPanel, ModelVersionNotesPanel]
      : [
          ...(latestVersionId ? [] : [ModelOverviewTitle]),
          ...(latestVersionId ? [] : [ModelDetailsPanel]),
          ...(latestVersionId ? [] : [ModelTagsPanel]),
          ...(latestVersionId ? [] : [FileAndVersionTitle]),
          ArtifactPanel,
          ConfigurationPanel,
          ...(latestVersionId ? [ModelTagsPanel] : []),
          ModelVersionNotesPanel,
        ];

  const form = useForm<ModelFileFormData | ModelUrlFormData>({
    mode: 'onChange',
    defaultValues,
    criteriaMode: 'all',
  });

  const onSubmit = useCallback(
    async (data: ModelFileFormData | ModelUrlFormData) => {
      try {
        const onComplete = (modelId: string) => {
          // Navigate to model group page
          history.push(generatePath(routerPaths.modelGroup, { id: modelId }));

          notifications?.toasts.addSuccess({
            title: mountReactNode(
              <EuiText>
                Artifact for <EuiTextColor color="success">{form.getValues('name')}</EuiTextColor>{' '}
                uploaded
              </EuiText>
            ),
            text: `The artifact for ${form.getValues('name')} uploaded successfully`,
          });
        };

        const onError = () => {
          notifications?.toasts.addDanger({
            title: mountReactNode(
              <EuiText>
                <EuiTextColor color="success">{form.getValues('name')}</EuiTextColor> artifact
                upload failed.
              </EuiText>
            ),
            text: 'The new version was not created.',
          });
        };

        if ('modelFile' in data) {
          const modelId = await submitModelWithFile(data);
          modelFileUploadManager.upload({
            file: data.modelFile,
            modelId,
            chunkSize: MAX_CHUNK_SIZE,
            onComplete,
            onError,
          });
        } else {
          const taskId = await submitModelWithURL(data);
          modelTaskManager.query({ taskId, onComplete, onError });
        }

        // Navigate to model list if form submit successfully
        history.push(routerPaths.modelList);

        if (latestVersionId) {
          notifications?.toasts.addSuccess({
            title: mountReactNode(
              <EuiText>
                A model artifact for{' '}
                <EuiTextColor color="success">{form.getValues('name')}</EuiTextColor> is uploading
              </EuiText>
            ),
            text: 'Once it uploads, a new version will be created.',
          });
        } else {
          notifications?.toasts.addSuccess({
            title: mountReactNode(
              <EuiText>
                <EuiTextColor color="success">{form.getValues('name')}</EuiTextColor> model creation
                complete.
              </EuiText>
            ),
            text:
              'The model artifact is uploading. Once it uploads, a new version will be created.',
          });
        }
      } catch (e) {
        if (e instanceof Error) {
          notifications?.toasts.addDanger({
            title: 'Model creation failed',
            text: e.message,
          });
        } else {
          notifications?.toasts.addDanger({
            title: 'Model creation failed',
            text: 'Unknown error',
          });
        }
      }
    },
    [notifications, form, latestVersionId, history]
  );

  useEffect(() => {
    if (!latestVersionId) return;
    const initializeForm = async () => {
      try {
        const data = await APIProvider.getAPI('model').getOne(latestVersionId);
        // TODO:  clarify which fields to pre-populate
        const { model_version: modelVersion, name, model_config: modelConfig } = data;
        const newVersion = upgradeModelVersion(modelVersion);
        form.setValue('name', name);
        form.setValue('version', newVersion);
        form.setValue('configuration', modelConfig?.all_config ?? '');
        setModelGroupName(name);
      } catch (e) {
        // TODO: handle error here
      }
    };
    initializeForm();
  }, [latestVersionId, form]);

  useEffect(() => {
    if (!nameParams) {
      return;
    }
    const subscriber = modelRepositoryManager
      .getPreTrainedModel$(nameParams, 'torch_script')
      .subscribe(
        (preTrainedModel) => {
          // TODO: Fill model format here
          const { config, url } = preTrainedModel;
          form.setValue('modelURL', url);
          if (config.name) {
            form.setValue('name', config.name);
          }
          if (config.description) {
            form.setValue('description', config.description);
          }
          if (config.model_config) {
            form.setValue('configuration', JSON.stringify(config.model_config));
          }
          setPreTrainedModelLoading(false);
        },
        (error) => {
          // TODO: Should handle loading error here
          // eslint-disable-next-line no-console
          console.log(error);
        }
      );
    return () => {
      subscriber.unsubscribe();
    };
  }, [nameParams, form]);

  const onError = useCallback((errors: FieldErrors<ModelFileFormData | ModelUrlFormData>) => {
    // TODO
    // eslint-disable-next-line no-console
    console.log(errors);
  }, []);

  const errorCount = Object.keys(form.formState.errors).length;
  const formHeader = (
    <>
      <EuiPageHeader pageTitle={latestVersionId ? 'Register version' : 'Register model'} />
      <EuiText style={{ maxWidth: 725 }}>
        <small>
          {latestVersionId && (
            <>
              Register a new version of <b>{modelGroupName}</b>. The version number will be
              automatically incremented.&nbsp;
              <EuiLink href="#" external>
                Learn More
              </EuiLink>
              .
            </>
          )}
          {formType === 'import' && !latestVersionId && <>Register a pre-trained model.</>}
          {formType === 'upload' && !latestVersionId && (
            <>
              Register your model to manage its life cycle, and facilitate model discovery across
              your organization.
            </>
          )}
        </small>
      </EuiText>
    </>
  );

  if (preTrainedModelLoading) {
    return (
      <EuiPanel>
        {formHeader}
        <EuiSpacer size="s" />
        <EuiLoadingSpinner aria-label="Model Form Loading" size="l" />
      </EuiPanel>
    );
  }

  return (
    <FormProvider {...form}>
      <EuiForm
        id={FORM_ID}
        data-test-subj="mlCommonsPlugin-registerModelForm"
        onSubmit={form.handleSubmit(onSubmit, onError)}
        component="form"
      >
        <EuiPanel>
          {formHeader}
          <EuiSpacer />
          {isSubmitted && !form.formState.isValid && (
            <>
              <ErrorCallOut />
              <EuiSpacer />
            </>
          )}
          {partials.map((FormPartial, i) => (
            <React.Fragment key={i}>
              <FormPartial />
              {FormPartial === ModelOverviewTitle || FormPartial === FileAndVersionTitle ? (
                <EuiSpacer size="s" />
              ) : (
                <EuiSpacer size="xl" />
              )}
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
                onClick={() => setIsSubmitted(true)}
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
