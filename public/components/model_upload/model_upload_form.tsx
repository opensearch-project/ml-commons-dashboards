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
}

export const ModelUploadForm = ({ onSubmit }: ModelUploadFormProps) => {
  const { register, handleSubmit, watch, control } = useForm<ModelUploadFormData>({
    defaultValues: {
      uploadType: UploadType.FILE,
    },
  });
  const { ref: nameRef, ...nameRegister } = register('name');
  const { ref: versionRef, ...versionRegister } = register('version');
  const { ref: descriptionRef, ...descriptionRegister } = register('description');
  const { ref: modelFormatRef, ...modelFormatRegister } = register('modelFormat');
  const { ref: modelConfigModelTypeRef, ...modelConfigModelTypeRegister } = register(
    'modelConfig.modelType'
  );
  const {
    ref: modelConfigEmbeddingDimensionRef,
    min,
    max,
    ...modelConfigEmbeddingDimensionRegister
  } = register('modelConfig.embeddingDimension');
  const { ref: modelConfigFrameworkTypeRef, ...modelConfigFrameworkTypeRegister } = register(
    'modelConfig.frameworkType'
  );
  const isUploadByURL = watch('uploadType') === UploadType.URL;

  return (
    <EuiForm onSubmit={handleSubmit(onSubmit)} component="form">
      <EuiFormRow label="Name">
        <EuiFieldText inputRef={nameRef} {...nameRegister} />
      </EuiFormRow>
      <EuiFormRow label="Version">
        <EuiFieldText inputRef={versionRef} {...versionRegister} />
      </EuiFormRow>
      <EuiFormRow label="Description">
        <EuiTextArea inputRef={descriptionRef} {...descriptionRegister} />
      </EuiFormRow>
      <EuiFormRow label="Model Format">
        <EuiFieldText inputRef={modelFormatRef} {...modelFormatRegister} />
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
        <EuiFieldText
          inputRef={modelConfigFrameworkTypeRef}
          {...modelConfigFrameworkTypeRegister}
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
