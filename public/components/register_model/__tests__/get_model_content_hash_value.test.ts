/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { getModelContentHashValue } from '../get_model_content_hash_value';

describe('getModelContentHashValue', () => {
  it('should return consistent sha256 value', async () => {
    expect(await getModelContentHashValue(new Blob(new Array(10000).fill(1)))).toBe(
      'd25f01257c9890622d78cf9cf3362457ef75712bd187ae33b383f80d618d0f06'
    );
  });
});
