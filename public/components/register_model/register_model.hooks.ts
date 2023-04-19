/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';

const keys = ['tag1', 'tag2'];
const values = ['value1', 'value2'];

const results = [
  {
    name: 'Accuracy: test',
    type: 'number' as const,
    values: [0.9, 0.8, 0.75],
  },
  {
    name: 'Accuracy: training',
    type: 'number' as const,
    values: [0.9, 0.8, 0.75],
  },
  {
    name: 'Accuracy: validation',
    type: 'number' as const,
    values: [0.9, 0.8, 0.75],
  },
  {
    name: 'Task',
    type: 'string' as const,
    values: [
      'Computer vision',
      'Image classification',
      'Image-to-image',
      'Natural language processing',
    ],
  },
  {
    name: 'Team',
    type: 'string' as const,
    values: ['IT', 'Finance', 'HR'],
  },
];

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

  return [loading, results] as const;
};
