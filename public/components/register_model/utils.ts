/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * import - import a OpenSearch pre-defined model
 * upload - user upload a model by himself/herself by register a new model or register a new version
 */
export function isValidModelRegisterFormType(
  type: string | null
): type is 'upload' | 'import' | 'external' {
  return type === 'upload' || type === 'import' || type === 'external';
}
