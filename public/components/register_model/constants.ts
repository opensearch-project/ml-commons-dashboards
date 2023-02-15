/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import { ONE_GB } from '../../../common/constant';

export const MAX_CHUNK_SIZE = 10 * 1000 * 1000;
export const MAX_MODEL_FILE_SIZE = 4 * ONE_GB;

export enum CUSTOM_FORM_ERROR_TYPES {
  DUPLICATE_NAME = 'duplicateName',
  FILE_SIZE_EXCEED_LIMIT = 'fileSizeExceedLimit',
  INVALID_CONFIGURATION = 'invalidConfiguration',
}

export const FORM_ERRORS = [
  {
    field: 'name',
    type: 'required',
    message: 'Name: Enter a name.',
  },
  {
    field: 'name',
    type: CUSTOM_FORM_ERROR_TYPES.DUPLICATE_NAME,
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
    field: 'configuration',
    type: 'required',
    message: 'JSON configuration: Add a JSON configuration.',
  },
  {
    field: 'configuration',
    type: CUSTOM_FORM_ERROR_TYPES.INVALID_CONFIGURATION,
    message: 'JSON configuration: Add valid JSON.',
  },
];
