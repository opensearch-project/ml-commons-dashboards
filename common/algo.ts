/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

// https://opensearch.org/docs/latest/ml-commons-plugin/algorithms/
export const SUPPORTED_ALGOS = [
  {
    name: 'K-means',
    value: 'kmeans',
    text: 'K-means',
    parameters: [
      {
        name: 'centroids',
        type: 'integer',
        default: 2,
        description: 'The number of clusters in which to group the generated data',
      },
      {
        name: 'iterations',
        type: 'integer',
        default: 10,
        description: 'The number of iterations to perform against the data until a mean generates',
      },
      {
        name: 'distance_type',
        type: 'enum',
        group: ['EUCLIDEAN', 'COSINE', 'L1'],
        default: 'EUCLIDEAN',
        description: 'The type of measurement from which to measure the distance between centroids',
      },
    ],
  },
  {
    name: 'Linear regression',
    value: 'LINEAR_REGRESSION',
    text: 'LINEAR_REGRESSION',
    parameters: [
      {
        name: 'target',
        type: 'string',
        default: 'price',
        description: 'The type of measurement from which to measure the distance between centroids',
      },
      {
        name: 'learningRate',
        type: 'integer',
        default: 0.01,
        description: 'The rate of speed at which the gradient moves during descent',
      },
      {
        name: 'momentumFactor',
        type: 'integer',
        default: 0,
        description: 'The medium-term from which the regressor rises or falls',
      },
      {
        name: 'epsilon',
        type: 'integer',
        default: 1.0e-6,
        description: 'The criteria used to identify a linear model',
      },
      {
        name: 'beta1',
        type: 'integer',
        default: 0.9,
        description: 'The estimated exponential decay for the moment',
      },
      {
        name: 'beta2',
        type: 'integer',
        default: 0.99,
        description: 'The estimated exponential decay for the moment',
      },
      {
        name: 'decayRate',
        type: 'integer',
        default: 0.9,
        description: 'The rate at which the model decays exponentially',
      },
    ],
  },
] as const;
export type ALGOS = typeof SUPPORTED_ALGOS[number]['value'];
export type ALGOS_PARAMS = typeof SUPPORTED_ALGOS[number]['parameters'];
export type AlgosFormParam = {
  name: string;
  description: string;
} & (
  | {
      type: 'string';
      default: 'string';
    }
  | {
      type: 'integer';
      default: number;
    }
  | {
      type: 'enum';
      default: string;
      group: string[];
    }
);
export type AlgosFormParams = AlgosFormParam[];
