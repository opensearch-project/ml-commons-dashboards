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
    name: 'Batch RCF',
    value: 'Batch_RCF',
    text: 'Batch RCF',
    parameters: [
      {
        name: 'number_of_trees',
        type: 'integer',
        default: 30,
        description: 'The number of trees in the forest',
      },
      {
        name: 'sample_size',
        type: 'integer',
        default: 256,
        description: 'The same size used by the stream samplers in the forest',
      },
      {
        name: 'output_after',
        type: 'integer',
        default: 32,
        description: 'The number of points required by stream samplers before results return',
      },
      {
        name: 'training_data_size',
        type: 'integer',
        default: 100,
        description: 'The size of your training data',
      },
      {
        name: 'anomaly_score_threshold',
        type: 'Double',
        default: 1.0,
        description: 'The threshold of the anomaly score',
      },
    ],
  },
  {
    name: 'FIT RCF',
    value: 'FIT_RCF',
    text: 'FIT RCF',
    parameters: [
      {
        name: 'number_of_trees',
        type: 'integer',
        default: 30,
        description: 'The number of trees in the forest',
      },
      {
        name: 'shingle_size',
        type: 'integer',
        default: 8,
        description: 'A shingle, or a consecutive sequence of the most recent records',
      },
      {
        name: 'sample_size',
        type: 'integer',
        default: 256,
        description: 'The same size used by the stream samplers in the forest',
      },
      {
        name: 'output_after',
        type: 'integer',
        default: 32,
        description: 'The number of points required by stream samplers before results return',
      },
      {
        name: 'time_decay',
        type: 'Double',
        default: 0.0001,
        description: 'The decay factor used by stream samplers in the forest',
      },
      {
        name: 'anomaly_rate',
        type: 'Double',
        default: 0.005,
        description: 'The anomaly rate',
      },
      {
        name: 'time_field',
        type: 'string',
        default: '',
        description: '(Required) The time filed for RCF to use as time series data',
      },
      {
        name: 'date_format',
        type: 'string',
        default: 'yyyy-MM-ddHH:mm:ss',
        description: 'The date and time format for the time_field field',
      },
      {
        name: 'time_zone',
        type: 'string',
        default: 'UTC',
        description: 'The time zone for the time_field field',
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
        default: '',
        description: 'The target field',
      },
      {
        name: 'learningRate',
        type: 'Double',
        default: 0.01,
        description: 'The rate of speed at which the gradient moves during descent',
      },
      {
        name: 'momentumFactor',
        type: 'Double',
        default: 0,
        description: 'The medium-term from which the regressor rises or falls',
      },
      {
        name: 'epsilon',
        type: 'Double',
        default: 1.0e-6,
        description: 'The criteria used to identify a linear model',
      },
      {
        name: 'beta1',
        type: 'Double',
        default: 0.9,
        description: 'The estimated exponential decay for the moment',
      },
      {
        name: 'beta2',
        type: 'Double',
        default: 0.99,
        description: 'The estimated exponential decay for the moment',
      },
      {
        name: 'decayRate',
        type: 'Double',
        default: 0.9,
        description: 'The rate at which the model decays exponentially',
      },
      {
        name: 'momentumType',
        type: 'enum',
        group: ['STANDARD', 'NESTEROV'],
        default: 'STANDARD',
        description:
          'The defined Stochastic Gradient Descent (SDG) momentum type that helps accelerate gradient vectors in the right directions, leading to a fast convergence',
      },
      {
        name: 'optimizerType',
        type: 'enum',
        group: [
          'SIMPLE_SGD',
          'LINEAR_DECAY_SGD',
          'SQRT_DECAY_SGD',
          'ADA_GRAD',
          'ADA_DELTA',
          'ADAM',
          'RMS_PROP',
        ],
        default: 'SIMPLE_SGD',
        description: 'The optimizer used in the model',
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
        type: 'Double',
        default: 1,
        description:
          'The gradient descent step size at each iteration when moving toward a minimum of a loss function or optimal value',
      },
      {
        name: 'momentumFactor',
        type: 'Double',
        default: 0,
        description:
          'The extra weight factors that accelerate the rate at which the weight is adjusted. This helps move the minimization routine out of local minima.',
      },
      {
        name: 'epsilon',
        type: 'Double',
        default: 0.1,
        description: 'The value for stabilizing gradient inversion',
      },
      {
        name: 'beta1',
        type: 'Double',
        default: 0.9,
        description: 'The exponential decay rates for the moment estimates',
      },
      {
        name: 'beta2',
        type: 'Double',
        default: 0.99,
        description: 'The exponential decay rates for the moment estimates',
      },
      {
        name: 'decayRate',
        type: 'Double',
        default: 0.9,
        description: 'The Root Mean Squared Propagation (RMSProp)',
      },
      {
        name: 'momentumType',
        type: 'enum',
        group: ['STANDARD', 'NESTEROV'],
        default: 'STANDARD',
        description:
          'The Stochastic Gradient Descent (SGD) momentum that helps accelerate gradient vectors in the right direction, leading to faster convergence between vectors',
      },
      {
        name: 'optimizerType',
        type: 'enum',
        group: [
          'SIMPLE_SGD',
          'LINEAR_DECAY_SGD',
          'SQRT_DECAY_SGD',
          'ADA_GRAD',
          'ADA_DELTA',
          'ADAM',
          'RMS_PROP',
        ],
        default: 'ADA_GRAD',
        description: 'The optimizer used in the model',
      },
      {
        name: 'target',
        type: 'string',
        default: 'class',
        description: 'The target field',
      },
      {
        name: 'objectiveType',
        type: 'enum',
        group: ['HINGE', 'LOGMULTICLASS'],
        default: 'LOGMULTICLASS',
        description: 'The objective function type',
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
  | {
      type: 'Double';
      default: number;
    }
);
export type AlgosFormParams = AlgosFormParam[];
