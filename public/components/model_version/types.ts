/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import type { Tag } from '../model/types';

interface ArtifactSourceFormData {
  artifactSource: 'source_not_changed' | 'source_from_computer' | 'source_from_url';
}

interface FormDataBase {
  versionNotes?: string;
  tags?: Tag[];
  configuration: string;
  modelFileFormat: string;
}

export interface ModelFileFormData extends FormDataBase, ArtifactSourceFormData {
  modelFile: File;
}

export interface ModelUrlFormData extends FormDataBase, ArtifactSourceFormData {
  modelURL: string;
}
