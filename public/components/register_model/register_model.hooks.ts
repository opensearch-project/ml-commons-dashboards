/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';

const keys = ['tag1', 'tag2'];
const values = ['value1', 'value2'];

/**
 * TODO: implement this function so that it retrieve tags from BE
 */
export const useModelTags = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, []);

  return [loading, { keys, values }] as const;
};
