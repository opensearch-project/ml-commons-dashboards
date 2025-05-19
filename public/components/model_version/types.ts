/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import type { Tag } from '../model/types';

export interface ModelVersionFormData {
  artifactSource?: 'source_not_changed' | 'source_from_computer' | 'source_from_url';
  versionNotes?: string;
  tags?: Tag[];
  configuration?: string;
  modelFileFormat?: string;
  modelFile?: File;
  modelURL?: string;
}
