/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  EuiFieldText,
  EuiForm,
  EuiFormRow,
  EuiButton,
  EuiTextArea,
  EuiRadioGroup,
  EuiFieldNumber,
  EuiFilePicker,
  EuiSelect,
} from '@elastic/eui';

enum UploadType {
  URL = 'url',
  FILE = 'file',
}

const uploadTypeRadios = [
  {
    id: UploadType.URL,
    label: 'By URL',
  },
  {
    id: UploadType.FILE,
    label: 'By Select File',
  },
];

enum ModelFormat {
  ONNX = 'ONNX',
  TorchScript = 'TORCH_SCRIPT',
}

const modelFormatOptions = [
  { text: 'ONNX', value: ModelFormat.ONNX },
  {
    text: 'Torch Script',
    value: ModelFormat.TorchScript,
  },
];

enum ModelFrameworkType {
  HuggingFaceTransformers = 'HUGGINGFACE_TRANSFORMERS',
  SentenceTransformers = 'SENTENCE_TRANSFORMERS',
}

const modelFrameworkTypeOptions = [
  {
    text: 'Hugging Face Transformers',
    value: ModelFrameworkType.HuggingFaceTransformers,
  },
  { text: 'Sentence Transformers', value: ModelFrameworkType.SentenceTransformers },
];

export interface URLModelUploadFormExtraData {
  url: string;
  uploadType: typeof UploadType.URL;
}
export interface FileModelUploadFormExtraData {
  uploadType: typeof UploadType.FILE;
  modelTaskType: string;
  file: File;
}

export type ModelUploadFormData = {
  name: string;
  version: string;
  description: string;
  modelFormat: string;
  modelConfig: {
    modelType: string;
    embeddingDimension: number;
    frameworkType: string;
  };
} & (URLModelUploadFormExtraData | FileModelUploadFormExtraData);

export const isURLModelUploadFormData = (
  test: ModelUploadFormData
): test is ModelUploadFormData & URLModelUploadFormExtraData => test.uploadType === UploadType.URL;
export const isFileModelUploadFormData = (
  test: ModelUploadFormData
): test is ModelUploadFormData & FileModelUploadFormExtraData =>
  test.uploadType === UploadType.FILE;

export interface ModelUploadFormProps {
  onSubmit: (data: ModelUploadFormData) => void;
  defaultValues?: Partial<ModelUploadFormData>;
  disabledFields?: Array<'name'>;
}

export const ModelUploadForm = ({
  onSubmit,
  defaultValues,
  disabledFields,
}: ModelUploadFormProps) => {
  const { register, handleSubmit, watch, control } = useForm<ModelUploadFormData>({
    defaultValues: {
      uploadType: UploadType.FILE,
      ...defaultValues,
    },
  });
  const { ref: nameRef, ...nameRegister } = register('name');
  const { ref: versionRef, ...versionRegister } = register('version');
  const { ref: descriptionRef, ...descriptionRegister } = register('description');
  const { ref: modelConfigModelTypeRef, ...modelConfigModelTypeRegister } = register(
    'modelConfig.modelType'
  );
  const {
    ref: modelConfigEmbeddingDimensionRef,
    min,
    max,
    ...modelConfigEmbeddingDimensionRegister
  } = register('modelConfig.embeddingDimension');
  const isUploadByURL = watch('uploadType') === UploadType.URL;

  return (
    <EuiForm onSubmit={handleSubmit(onSubmit)} component="form">
      <EuiFormRow label="Name">
        <EuiFieldText
          disabled={disabledFields?.includes('name')}
          inputRef={nameRef}
          {...nameRegister}
        />
      </EuiFormRow>
      <EuiFormRow label="Version">
        <EuiFieldText inputRef={versionRef} {...versionRegister} />
      </EuiFormRow>
      <EuiFormRow label="Description">
        <EuiTextArea inputRef={descriptionRef} {...descriptionRegister} />
      </EuiFormRow>
      <EuiFormRow label="Model Format">
        <Controller
          name="modelFormat"
          control={control}
          render={({ field }) => (
            <EuiSelect options={modelFormatOptions} hasNoInitialSelection {...field} />
          )}
        />
      </EuiFormRow>
      <EuiFormRow label="Model Config Model Type">
        <EuiFieldText inputRef={modelConfigModelTypeRef} {...modelConfigModelTypeRegister} />
      </EuiFormRow>
      <EuiFormRow label="Model Config Embedding Dimension">
        <EuiFieldNumber
          inputRef={modelConfigEmbeddingDimensionRef}
          {...modelConfigEmbeddingDimensionRegister}
        />
      </EuiFormRow>
      <EuiFormRow label="Model Config Framework Type">
        <Controller
          name="modelConfig.frameworkType"
          control={control}
          render={({ field }) => (
            <EuiSelect options={modelFrameworkTypeOptions} hasNoInitialSelection {...field} />
          )}
        />
      </EuiFormRow>
      <EuiFormRow label="Upload Type">
        <Controller
          name="uploadType"
          control={control}
          render={({ field }) => (
            <EuiRadioGroup
              options={uploadTypeRadios}
              idSelected={field.value}
              name={field.name}
              onChange={field.onChange}
            />
          )}
        />
      </EuiFormRow>
      {isUploadByURL ? (
        <EuiFormRow label="Model URL">
          <Controller
            name="url"
            control={control}
            render={({ field }) => <EuiFieldText {...field} />}
          />
        </EuiFormRow>
      ) : (
        <>
          <EuiFormRow label="Model Task Type">
            <Controller
              name="modelTaskType"
              control={control}
              render={({ field }) => <EuiFieldText {...field} />}
            />
          </EuiFormRow>
          <EuiFormRow label="Model File">
            <Controller
              name="file"
              control={control}
              render={({ field: { onChange, onBlur } }) => (
                <EuiFilePicker
                  initialPromptText="Select or drag and drop model file"
                  display="large"
                  onChange={(fileList) => {
                    onChange(fileList?.item(0));
                  }}
                  onBlur={onBlur}
                />
              )}
            />
          </EuiFormRow>
        </>
      )}
      <EuiFormRow>
        <EuiButton type="submit" fill>
          Upload
        </EuiButton>
      </EuiFormRow>
    </EuiForm>
  );
};
