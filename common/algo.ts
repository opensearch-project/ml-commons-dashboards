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
  {
    name: 'RCF_SUMMARIZE',
    value: 'RCF_SUMMARIZE',
    text: 'RCF_SUMMARIZE',
    parameters: [
      {
        name: 'centroids',
        type: 'integer',
        default: 3,
        description: 'The number of clusters in which to group the generated data',
      },
      {
        name: 'max_k',
        type: 'integer',
        default: 2,
        description: 'The max allowed number of centroids',
      },
      {
        name: 'distance_type',
        type: 'enum',
        group: ['EUCLIDEAN', 'LInfinity', 'L1', 'L2'],
        default: 'L1',
        description: 'The type of measurement from which to measure the distance between centroids',
      },
    ],
  },
  {
    name: 'LOGISTIC_REGRESSION',
    value: 'logistic_regression',
    text: 'LOGISTIC_REGRESSION',
    parameters: [
      {
        name: 'learningRate',
        type: 'integer',
        default: 1,
        description:
          'The gradient descent step size at each iteration when moving toward a minimum of a loss function or optimal value',
      },
      {
        name: 'momentumFactor',
        type: 'integer',
        default: 0,
        description:
          'The extra weight factors that accelerate the rate at which the weight is adjusted. This helps move the minimization routine out of local minima.',
      },
      {
        name: 'epsilon',
        type: 'integer',
        default: 0.1,
        description: 'The value for stabilizing gradient inversion',
      },
      {
        name: 'beta1',
        type: 'integer',
        default: 0.9,
        description: 'The exponential decay rates for the moment estimates',
      },
      {
        name: 'beta2',
        type: 'integer',
        default: 0.99,
        description: 'The exponential decay rates for the moment estimates',
      },
      {
        name: 'decayRate',
        type: 'integer',
        default: 0.9,
        description: 'The Root Mean Squared Propagation (RMSProp)',
      },
      {
        name: 'epochs',
        type: 'integer',
        default: 5,
        description: 'The number of iterations',
      },
      {
        name: 'batchSize',
        type: 'integer',
        default: 1,
        description: 'The size of minbatches',
      },
      {
        name: 'loggingInterval',
        type: 'integer',
        default: 1000,
        description:
          'The interval of logs lost after many iterations. The interval is 1 if the algorithm contains no logs.',
      },
      {
        name: 'target',
        type: 'string',
        default: 'class',
        description: 'The target field',
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
