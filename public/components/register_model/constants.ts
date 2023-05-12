/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import { ONE_GB } from '../../../common/constant';
import { MODEL_NAME_FIELD_DUPLICATE_NAME_ERROR } from '../../components/common';

export const MAX_CHUNK_SIZE = 10 * 1000 * 1000;
export const MAX_MODEL_FILE_SIZE = 4 * ONE_GB;

export enum CUSTOM_FORM_ERROR_TYPES {
  DUPLICATE_NAME = MODEL_NAME_FIELD_DUPLICATE_NAME_ERROR,
  FILE_SIZE_EXCEED_LIMIT = 'fileSizeExceedLimit',
  INVALID_CONFIGURATION = 'invalidConfiguration',
  CONFIGURATION_MISSING_MODEL_TYPE = 'configurationMissingModelType',
  INVALID_MODEL_TYPE_VALUE = 'invalidModelTypeValue',
  INVALID_EMBEDDING_DIMENSION_VALUE = 'invalidEmbeddingDimensionValue',
  INVALID_FRAMEWORK_TYPE_VALUE = 'invalidFrameworkTypeValue',
}

export const FORM_ERRORS = [
  {
    field: 'name',
    type: 'required',
    message: 'Name: Enter a name.',
  },
  {
    field: 'name',
    type: MODEL_NAME_FIELD_DUPLICATE_NAME_ERROR,
    message: 'Name: Use a unique name.',
  },
  {
    field: 'modelFile',
    type: 'required',
    message: 'File: Add a file.',
  },
  {
    field: 'modelFile',
    type: CUSTOM_FORM_ERROR_TYPES.FILE_SIZE_EXCEED_LIMIT,
    message: `File: Add a file below ${MAX_MODEL_FILE_SIZE / ONE_GB} GB.`,
  },
  {
    field: 'modelURL',
    type: 'required',
    message: 'URL: Enter a URL.',
  },
  {
    field: 'modelURL',
    type: 'pattern',
    message: 'URL: Enter a valid URL.',
  },
  {
    field: 'modelFormat',
    type: 'required',
    message: 'Model file format: Select a model file format.',
  },
  {
    field: 'modelFileFormat',
    type: 'required',
    message: 'Model file format: Select a model format.',
  },
  {
    field: 'configuration',
    type: 'required',
    message: 'JSON configuration: Add a JSON configuration.',
  },
  {
    field: 'configuration',
    type: CUSTOM_FORM_ERROR_TYPES.INVALID_CONFIGURATION,
    message: 'JSON configuration: Add valid JSON.',
  },
  {
    field: 'configuration',
    type: CUSTOM_FORM_ERROR_TYPES.CONFIGURATION_MISSING_MODEL_TYPE,
    message: 'JSON configuration: specify the model_type.',
  },
  {
    field: 'configuration',
    type: CUSTOM_FORM_ERROR_TYPES.INVALID_MODEL_TYPE_VALUE,
    message: 'JSON configuration: model_type must be a string.',
  },
  {
    field: 'configuration',
    type: CUSTOM_FORM_ERROR_TYPES.INVALID_EMBEDDING_DIMENSION_VALUE,
    message: 'JSON configuration: embedding_dimension must be a number.',
  },
  {
    field: 'configuration',
    type: CUSTOM_FORM_ERROR_TYPES.INVALID_FRAMEWORK_TYPE_VALUE,
    message: 'JSON configuration: framework_type must be a string.',
  },
];
