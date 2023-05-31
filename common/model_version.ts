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

export const isModelDeployable = (state: MODEL_VERSION_STATE) => {
  if (
    state === MODEL_VERSION_STATE.undeployed ||
    state === MODEL_VERSION_STATE.registered ||
    state === MODEL_VERSION_STATE.deployFailed
  ) {
    return true;
  }
  return false;
};

export const isModelUndeployable = (state: MODEL_VERSION_STATE) => {
  if (state === MODEL_VERSION_STATE.deployed || state === MODEL_VERSION_STATE.partiallyDeployed) {
    return true;
  }
  return false;
};
