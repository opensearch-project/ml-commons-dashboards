/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { APIProvider } from '../../apis/api_provider';
import { getModelContentHashValue } from './get_model_content_hash_value';
import { ModelFileFormData, ModelUrlFormData } from './register_model.types';

const metricNames = ['Metric 1', 'Metric 2', 'Metric 3', 'Metric 4'];

/**
 * TODO: implement this function so that it retrieve metric names from BE
 */
export const useMetricNames = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, []);

  return [loading, metricNames] as const;
};

const keys = ['tag1', 'tag2'];
const values = ['value1', 'value2'];

/**
 * TODO: implement this function so that it retrieve tags from BE
 */
export const useModelTags = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, []);

  return [loading, { keys, values }] as const;
};

const isUploadByURL = (model: { modelURL?: string; modelFile?: File }): model is ModelUrlFormData =>
  !!model.modelURL;

export const useModelUpload = () => {
  const timeoutIdRef = useRef(-1);
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
      window.clearTimeout(timeoutIdRef.current);
    };
  }, []);

  return useCallback(async (model: ModelFileFormData | ModelUrlFormData) => {
    const modelUploadBase = {
      name: model.name,
      version: model.version,
      description: model.description,
      // TODO: Need to confirm if we have the model format input
      modelFormat: 'TORCH_SCRIPT',
      modelConfig: JSON.parse(model.configuration),
    };
    if (isUploadByURL(model)) {
      const { task_id: taskId } = await APIProvider.getAPI('model').upload({
        ...modelUploadBase,
        url: model.modelURL,
      });
      return new Promise<string>((resolve, reject) => {
        const refreshTaskStatus = () => {
          APIProvider.getAPI('task')
            .getOne(taskId)
            .then(({ model_id: modelId, error }) => {
              if (error) {
                reject(error);
                return;
              }
              if (modelId === undefined) {
                if (!mountedRef.current) {
                  reject('component unmounted');
                  return;
                }
                timeoutIdRef.current = window.setTimeout(refreshTaskStatus, 1000);
                return;
              }
              resolve(modelId);
            });
        };
        if (!mountedRef.current) {
          reject('component unmounted');
          return;
        }
        refreshTaskStatus();
      });
    }
    const { modelFile } = model;
    const MAX_CHUNK_SIZE = 10 * 1000 * 1000;
    const totalChunks = Math.ceil(modelFile.size / MAX_CHUNK_SIZE);
    const modelContentHashValue = await getModelContentHashValue(modelFile);

    const modelId = (
      await APIProvider.getAPI('model').upload({
        ...modelUploadBase,
        totalChunks,
        modelContentHashValue,
      })
    ).model_id;

    for (let i = 0; i < totalChunks; i++) {
      const chunk = modelFile.slice(
        MAX_CHUNK_SIZE * i,
        Math.min(MAX_CHUNK_SIZE * (i + 1), modelFile.size)
      );
      await APIProvider.getAPI('model').uploadChunk(modelId, `${i}`, chunk);
    }
    return modelId;
  }, []);
};
