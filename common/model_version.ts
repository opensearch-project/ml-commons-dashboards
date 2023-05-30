/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

// TODO: rename the enum keys accordingly
export enum MODEL_VERSION_STATE {
  deployed = 'DEPLOYED',
  trained = 'TRAINED',
  undeployed = 'UNDEPLOYED',
  registered = 'REGISTERED',
  registering = 'REGISTERING',
  deploying = 'DEPLOYING',
  partiallyDeployed = 'PARTIALLY_DEPLOYED',
  deployFailed = 'DEPLOY_FAILED',
  registerFailed = 'REGISTER_FAILED',
}
