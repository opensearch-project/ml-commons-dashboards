/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useRef, useState } from 'react';
import {
  EuiLoadingSpinner,
  EuiModal,
  EuiModalBody,
  EuiModalHeader,
  EuiModalHeaderTitle,
  EuiPageHeader,
} from '@elastic/eui';

import { CoreStart } from 'opensearch-dashboards/public';
import {
  isURLModelUploadFormData,
  ModelUploadForm,
  ModelUploadFormData,
} from './model_upload_form';
import { APIProvider } from '../../apis/api_provider';
import { getModelContentHasnValue } from './get_model_content_hash_value';
import { usePollingUntil } from '../../hooks/use_polling_until';

enum LoadingModel {
  HIDE,
  TASK,
  CHUNK,
}

export function ModelUpload({ notifications }: { notifications: CoreStart['notifications'] }) {
  const [loadingModelState, setLoadingModelState] = useState(LoadingModel.HIDE);
  const [uploadChunkProgress, setUploadChunkProgress] = useState('');
  const uploadTaskIdRef = useRef('');

  const showModelUploadSuccessToast = useCallback(() => {
    notifications.toasts.addSuccess('Model upload success');
  }, [notifications.toasts]);

  const showModelUploadErrorToast = useCallback(() => {
    notifications.toasts.addDanger('Model upload Failed');
  }, [notifications.toasts]);

  const { start } = usePollingUntil({
    pollingGap: 1000,
    continueChecker: () =>
      APIProvider.getAPI('task')
        .getOne(uploadTaskIdRef.current)
        .then(({ state }) => state === 'RUNNING' || state === 'CREATED'),
    onGiveUp: () => {
      APIProvider.getAPI('task')
        .getOne(uploadTaskIdRef.current)
        .then((task) => {
          switch (task.state) {
            case 'FAILED':
              showModelUploadErrorToast();
              break;
            default:
              showModelUploadSuccessToast();
          }
        });
      uploadTaskIdRef.current = '';
      setLoadingModelState(LoadingModel.HIDE);
    },
    onMaxRetries: () => {
      uploadTaskIdRef.current = '';
      setLoadingModelState(LoadingModel.HIDE);
    },
  });
  const handleSubmit = useCallback(
    async (model: ModelUploadFormData) => {
      const modelUploadBase = {
        name: model.name,
        version: model.version,
        description: model.description,
        modelFormat: model.modelFormat,
        modelConfig: model.modelConfig,
      };
      if (isURLModelUploadFormData(model)) {
        const { taskId } = await APIProvider.getAPI('model').upload({
          ...modelUploadBase,
          url: model.url,
        });
        uploadTaskIdRef.current = taskId;
        setLoadingModelState(LoadingModel.TASK);
        start();
        return;
      }
      const MAX_CHUNK_SIZE = 10 * 1000 * 1000;
      const totalChunks = Math.ceil(model.file.size / MAX_CHUNK_SIZE);
      let modelId: string;

      setUploadChunkProgress(`(Calculate file sha256)`);
      setLoadingModelState(LoadingModel.CHUNK);
      try {
        const modelContentHashValue = await getModelContentHasnValue(model.file);

        modelId = (
          await APIProvider.getAPI('model').upload({
            ...modelUploadBase,
            modelTaskType: model.modelTaskType,
            totalChunks,
            modelContentHashValue,
          })
        ).modelId;
      } catch (e) {
        showModelUploadErrorToast();
        return;
      }
      setUploadChunkProgress(`(0/${totalChunks})`);

      try {
        for (let i = 0; i < totalChunks; i++) {
          const chunk = model.file.slice(
            MAX_CHUNK_SIZE * i,
            Math.min(MAX_CHUNK_SIZE * (i + 1), model.file.size)
          );
          await APIProvider.getAPI('model').uploadChunk(modelId, `${i}`, chunk);
          setUploadChunkProgress(`(${i + 1}/${totalChunks})`);
        }
        showModelUploadSuccessToast();
      } catch {
        showModelUploadErrorToast();
        return;
      } finally {
        setUploadChunkProgress('');
        setLoadingModelState(LoadingModel.HIDE);
      }
    },
    [showModelUploadSuccessToast, showModelUploadErrorToast, start]
  );
  return (
    <>
      <EuiPageHeader pageTitle="Model Upload" />
      <ModelUploadForm onSubmit={handleSubmit} />
      {loadingModelState !== LoadingModel.HIDE && (
        <EuiModal onClose={() => {}}>
          <EuiModalHeader>
            <EuiModalHeaderTitle>
              <h1>Model Uploading</h1>
            </EuiModalHeaderTitle>
          </EuiModalHeader>
          <EuiModalBody>
            <EuiLoadingSpinner />
            {loadingModelState === LoadingModel.TASK
              ? 'Loading model upload task states'
              : `Uploading model entries${uploadChunkProgress}`}
          </EuiModalBody>
        </EuiModal>
      )}
    </>
  );
}
