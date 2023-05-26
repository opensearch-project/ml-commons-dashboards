/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import type { Tag } from '../model/types';

interface ModelFormBase {
  name: string;
  modelId?: string;
  description?: string;
  configuration: string;
  modelFileFormat: string;
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
