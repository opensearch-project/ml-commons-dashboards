/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import type { Tag } from '../model/types';

export interface ModelFormBase {
  name: string;
  version?: string;
  modelId?: string;
  description?: string;
  modelFileFormat: string;
  tags?: Tag[];
  versionNotes?: string;
  type?: 'import' | 'upload' | 'external';
  deployment: boolean;
}

/**
 * The type of the register model form data via uploading a model file
 */
export interface ModelFileFormData extends ModelFormBase {
  modelFile: File;
  configuration: string;
}

/**
 * The type of the register model form data via typing a model URL
 */
export interface ModelUrlFormData extends ModelFormBase {
  modelURL: string;
  configuration: string;
}
