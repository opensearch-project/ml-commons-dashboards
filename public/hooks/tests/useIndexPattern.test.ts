/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { renderHook } from '@testing-library/react-hooks';
import { useIndexPatterns } from '../useIndexPattern';

describe('useIndexPatterns', () => {
  it('should return empty array when no data param', () => {
    const { result } = renderHook(() => useIndexPatterns());
    expect(result.current.indexPatterns).toStrictEqual([]);
    expect(result.current.error).toStrictEqual(undefined);
    expect(result.current.loading).toStrictEqual(true);
  });
});
