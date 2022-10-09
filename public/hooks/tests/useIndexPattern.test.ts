/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { renderHook } from '@testing-library/react-hooks';
import { useIndexPatterns } from '../useIndexPattern';

describe('useIndexPatterns', () => {
  it('should return empty array when no data param', () => {
    const { result } = renderHook(() => useIndexPatterns());
    expect(result.current.indexPatterns).toBe([]);
    expect(result.current.error).toBe(undefined);
    expect(result.current.loading).toBe(true);
  });
});
