/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { Observable, from, throwError } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { APIProvider } from '../apis/api_provider';

interface PreTrainedModelInfo {
  model_url: string;
  config_url: string;
}

interface PreTrainedModel {
  version: string;
  description: string;
  torch_script: PreTrainedModelInfo;
  onnx: PreTrainedModelInfo;
}

interface PreTrainedModels {
  [key: string]: PreTrainedModel;
}

export class ModelRepositoryManager {
  private preTrainedModels: Observable<PreTrainedModels> | null = null;
  private preTrainedModelConfigs: Map<string, Observable<{ url: string; config: any }>> = new Map();

  constructor() {}

  getPreTrainedModels$() {
    if (!this.preTrainedModels) {
      this.preTrainedModels = from(
        APIProvider.getAPI('modelRepository').getPreTrainedModels()
      ).pipe(
        catchError((err) => {
          this.preTrainedModels = null;
          return throwError(err);
        })
      );
    }
    return this.preTrainedModels;
  }

  getPreTrainedModel$(name: string, format: 'torch_script' | 'onnx') {
    return this.getPreTrainedModels$().pipe(
      switchMap((models) => {
        const model = models[name];
        const modelInfo = model[format];
        let modelConfig$ = this.preTrainedModelConfigs.get(modelInfo.config_url);
        if (!modelConfig$) {
          modelConfig$ = from(
            APIProvider.getAPI('modelRepository').getPreTrainedModelConfig(modelInfo.config_url)
          )
            .pipe(
              map((config) => ({
                url: modelInfo.model_url,
                config,
              }))
            )
            .pipe(
              catchError((err) => {
                this.preTrainedModelConfigs.delete(modelInfo.config_url);
                return throwError(err);
              })
            );
          this.preTrainedModelConfigs.set(modelInfo.config_url, modelConfig$);
        }
        return modelConfig$;
      })
    );
  }
}

export const modelRepositoryManager = new ModelRepositoryManager();
