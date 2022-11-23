/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { generateTermQuery } from './query';

export const convertModelSource = (source: {
  model_content: string;
  name: string;
  algorithm: string;
  model_context: string;
  model_train_time: number;
}) => ({
  content: source.model_content,
  name: source.name,
  algorithm: source.algorithm,
  context: source.model_context,
  trainTime: source.model_train_time,
});

const genereateContextQuery = (context: Record<string, Array<string | number>>) => {
  const keys = Object.keys(context);
  return keys.map((key) => {
    const value = context[key];
    const fieldKey = `model_context.${key}`;

    if (typeof value[0] === 'string') {
      return {
        bool: {
          should: value.map((text) => ({
            match: {
              [fieldKey]: text,
            },
          })),
        },
      };
    }
    return generateTermQuery(fieldKey, value);
  });
};

export const generateModelSearchQuery = ({
  ids,
  algorithms,
  context,
  trainedStart,
  trainedEnd,
}: {
  ids?: string[];
  algorithms?: string[];
  context?: Record<string, Array<string | number>>;
  trainedStart?: number;
  trainedEnd?: number;
}) => ({
  bool: {
    must: [
      ...(ids ? [{ ids: { values: ids } }] : []),
      ...(algorithms ? [generateTermQuery('algorithm', algorithms)] : []),
      ...(context ? genereateContextQuery(context) : []),
      ...(trainedStart || trainedEnd
        ? [
            {
              range: {
                model_train_time: {
                  ...(trainedStart ? { gte: trainedStart } : {}),
                  ...(trainedEnd ? { lte: trainedEnd } : {}),
                },
              },
            },
          ]
        : []),
    ],

    must_not: {
      exists: {
        field: 'chunk_number',
      },
    },
  },
});
