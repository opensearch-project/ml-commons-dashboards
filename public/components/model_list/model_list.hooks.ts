/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';

/**
 * TODO: implement this function so that it retrieve tags from BE
 */
export const useModelTagKeys = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, []);

  return [
    loading,
    [
      { name: 'Accuracy: test', type: 'string' as const },
      { name: 'F1', type: 'number' as const },
    ] as Array<{ name: string; type: 'string' | 'number' }>,
  ] as const;
};
