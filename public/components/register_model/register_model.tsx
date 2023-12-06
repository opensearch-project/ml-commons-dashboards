/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useEffect, useState, useMemo } from 'react';
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
  EuiPageContent,
} from '@elastic/eui';
import useObservable from 'react-use/lib/useObservable';
import { from } from 'rxjs';
import { APIProvider } from '../../apis/api_provider';
import { useSearchParams } from '../../hooks/use_search_params';
import { isValidModelRegisterFormType } from './utils';
import { useOpenSearchDashboards } from '../../../../../src/plugins/opensearch_dashboards_react/public';
import { mountReactNode } from '../../../../../src/core/public/utils';
import { routerPaths } from '../../../common/router_paths';
import { ErrorCallOut } from '../../components/common';
import { modelRepositoryManager } from '../../utils/model_repository_manager';
import { PreTrainedModelSelect } from './pretrained_model_select';
import { modelTaskManager } from './model_task_manager';
import { ModelVersionNotesPanel } from './model_version_notes';
import { modelFileUploadManager } from './model_file_upload_manager';
import { MAX_CHUNK_SIZE, FORM_ERRORS } from '../common/forms/form_constants';
import { ModelDetailsPanel } from './model_details';
import type { ModelFileFormData, ModelFormBase, ModelUrlFormData } from './register_model.types';
import { ArtifactPanel } from './artifact';
import { ConfigurationPanel } from './model_configuration';
import { ModelTagsPanel } from './model_tags';
import { submitModelWithFile, submitModelWithURL } from './register_model_api';
import { ModelSource } from './model_source';
import { ModelDeployment } from './model_deployment';
const DEFAULT_VALUES = {
  name: '',
  description: '',
  version: '1',
  configuration: '',
  tags: [{ key: '', value: '', type: 'string' as const }],
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
  const { id: registerToModelId } = useParams<{ id: string | undefined }>();
  const [modelGroupName, setModelGroupName] = useState<string>();
  const searchParams = useSearchParams();
  const typeParams = searchParams.get('type');
  const nameParams = searchParams.get('name');

  const {
    services: { chrome, notifications },
  } = useOpenSearchDashboards();
  const isLocked = useObservable(chrome?.getIsNavDrawerLocked$() ?? from([false]));
  const formType = isValidModelRegisterFormType(typeParams) ? typeParams : 'upload';
  const partials = (() => {
    if (formType === 'import') {
      if (!nameParams) {
        return [PreTrainedModelSelect];
      }
      return [
        PreTrainedModelSelect,
        ModelDetailsPanel,
        ModelTagsPanel,
        ModelVersionNotesPanel,
        ModelDeployment,
      ];
    }
    if (formType === 'external') {
      return [
        ...(registerToModelId ? [] : [ModelDetailsPanel]),
        ...(registerToModelId ? [] : [ModelTagsPanel]),
        ModelSource,
        ModelVersionNotesPanel,
        ModelDeployment,
      ];
    }
    return [
      ...(registerToModelId ? [] : [ModelOverviewTitle]),
      ...(registerToModelId ? [] : [ModelDetailsPanel]),
      ...(registerToModelId ? [] : [ModelTagsPanel]),
      ...(registerToModelId ? [] : [FileAndVersionTitle]),
      ArtifactPanel,
      ConfigurationPanel,
      ...(registerToModelId ? [ModelTagsPanel] : []),
      ModelVersionNotesPanel,
      ModelDeployment,
    ];
  })();

  const form = useForm<ModelFileFormData | ModelUrlFormData>({
    mode: 'onChange',
    defaultValues,
    criteriaMode: 'all',
  });

  // formState.errors won't change after formState updated, need to update errors object manually
  const formErrors = useMemo(() => ({ ...form.formState.errors }), [form.formState]);

  const onSubmit = useCallback(
    async (data: ModelFileFormData | ModelUrlFormData | ModelFormBase) => {
      try {
        const onComplete = () => {
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
        let modelId;
        if ('modelFile' in data) {
          const result = await submitModelWithFile(data);
          modelFileUploadManager.upload({
            file: data.modelFile,
            modelId: result.modelVersionId,
            chunkSize: MAX_CHUNK_SIZE,
            onComplete,
            onError,
          });
          modelId = result.modelId;
        } else {
          const result = await submitModelWithURL(data);
          modelTaskManager.query({
            taskId: result.taskId,
            onComplete,
            onError,
          });
          modelId = result.modelId;
        }

        // Navigate to model list if form submit successfully
        history.push(generatePath(routerPaths.model, { id: modelId }));

        if (data.modelId) {
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
    [notifications, form, history]
  );

  useEffect(() => {
    if (!registerToModelId) return;
    const initializeForm = async () => {
      form.setValue('modelId', registerToModelId);
      try {
        const data = await APIProvider.getAPI('model').getOne(registerToModelId);
        // TODO:  clarify which fields to pre-populate
        const { name } = data;
        form.setValue('name', name);
        setModelGroupName(name);
      } catch (e) {
        // TODO: handle error here
      }
    };
    initializeForm();
  }, [registerToModelId, form]);

  useEffect(() => {
    if (!nameParams) {
      return;
    }
    const subscriber = modelRepositoryManager
      .getPreTrainedModel$(nameParams, 'torch_script')
      .subscribe(
        (preTrainedModel) => {
          // TODO: Fill model format here
          const { config } = preTrainedModel;
          form.setValue('modelFileFormat', 'TORCH_SCRIPT');
          if (config.name) {
            form.setValue('name', config.name);
          }
          if (config.version) {
            form.setValue('version', config.version);
          }
          if (config.description) {
            form.setValue('description', config.description);
          }
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

  useEffect(() => {
    form.setValue('type', formType);
  }, [formType, form]);

  const onError = useCallback((errors: FieldErrors<ModelFileFormData | ModelUrlFormData>) => {
    // TODO
    // eslint-disable-next-line no-console
    console.log(errors);
  }, []);
  const getPageTitle = () => {
    if (registerToModelId) {
      return 'Register version';
    }
    switch (formType) {
      case 'external':
        return 'Register external model';
      case 'external':
        return 'Register pre-trained model';
      default:
        return 'Register your own model';
    }
  };
  const errorCount = Object.keys(form.formState.errors).length;
  const formHeader = (
    <>
      <EuiPageHeader pageTitle={getPageTitle} />
      <EuiText style={{ maxWidth: 725 }}>
        <small>
          {registerToModelId && (
            <>
              Register a new version of <b>{modelGroupName}</b>. The version number will be
              automatically incremented.&nbsp;
              <EuiLink href="#" external>
                Learn More
              </EuiLink>
              .
            </>
          )}
          {formType === 'external' && !registerToModelId && <>Description lorem.</>}
          {formType === 'import' && !registerToModelId && <>Register a pre-trained model.</>}
          {formType === 'upload' && !registerToModelId && (
            <>
              Register your model to manage its life cycle, and facilitate model discovery across
              your organization.
            </>
          )}
        </small>
      </EuiText>
    </>
  );
  return (
    <EuiPageContent
      verticalPosition="center"
      horizontalPosition="center"
      paddingSize="none"
      style={{ width: 1000 }}
    >
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
                <ErrorCallOut formErrors={formErrors} errorMessages={FORM_ERRORS} />
                <EuiSpacer />
              </>
            )}
            {partials.map((FormPartial, i) => (
              <React.Fragment key={i}>
                {FormPartial === PreTrainedModelSelect ? <FormPartial /> : <FormPartial />}
                {FormPartial === ModelOverviewTitle || FormPartial === FileAndVersionTitle ? (
                  <EuiSpacer size="s" />
                ) : (
                  <EuiSpacer size="xl" />
                )}
              </React.Fragment>
            ))}
            {/* {formType === 'import' ? nameParams && formFooter : formFooter} */}
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
                <EuiButton onClick={() => setIsSubmitted(false)} iconType="cross" color="ghost">
                  Cancel
                </EuiButton>
              </EuiFlexItem>
              <EuiFlexItem grow={false}>
                <EuiButton
                  form={FORM_ID}
                  disabled={form.formState.isSubmitting}
                  isLoading={form.formState.isSubmitting}
                  type="submit"
                  onClick={() => setIsSubmitted(true)}
                  fill
                >
                  {registerToModelId ? 'Register version' : 'Register model'}
                </EuiButton>
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiBottomBar>
        </EuiForm>
      </FormProvider>
    </EuiPageContent>
  );
};
