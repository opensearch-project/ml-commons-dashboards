/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Tag {
  key: string;
  value: string;
}

interface ModelFormBase {
  name: string;
  version: string;
  description: string;
  configuration: string;
  tags?: Tag[];
  versionNotes?: string;
}

/**
 * The type of the register model form data via uploading a model file
 */
export interface ModelFileFormData extends ModelFormBase {
  modelFile: File;
}

/**
 * The type of the register model form data via typing a model URL
 */
export interface ModelUrlFormData extends ModelFormBase {
  modelURL: string;
}
