/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import type { Tag } from '../model/types';

interface FormDataBase {
  versionNotes?: string;
  tags?: Tag[];
  configuration: string;
  modelFileFormat: string;
}

export interface ModelFileFormData extends FormDataBase {
  modelFile: File;
}

export interface ModelUrlFormData extends FormDataBase {
  modelURL: string;
}
