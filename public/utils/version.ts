/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

export const upgradeModelVersion = (version: string) => {
  //TODO:determine whether BE version follows semver
  const num = Number(version.split('.').reduce((prev, i) => prev + i, ''));
  return String(num + 1)
    .split('')
    .toString()
    .replaceAll(',', '.');
};
