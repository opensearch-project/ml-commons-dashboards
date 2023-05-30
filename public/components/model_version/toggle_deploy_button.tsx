/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState, useCallback } from 'react';
import { EuiButton, EuiConfirmModal } from '@elastic/eui';

import { MODEL_VERSION_STATE } from '../../../common';
import { useDeployment } from '../../hooks/use_deployment';

// CREATED,
// RUNNING,
// COMPLETED,
// FAILED,
// CANCELLED,
// COMPLETED_WITH_ERROR

export interface Props {
  modelState: MODEL_VERSION_STATE | undefined;
  modelVersionId: string;
  modelName: string;
  modelVersion: string;
  // called when deploy or undeploy completed
  onComplete: () => void;
}

export const ToggleDeployButton = ({
  modelState,
  modelName,
  modelVersion,
  modelVersionId,
  onComplete,
}: Props) => {
  const [loading, setLoading] = useState(false);
  const [isDeployModalVisible, setIsDeployModalVisible] = useState(false);
  const [isUndeployModalVisible, setIsUndeployModalVisible] = useState(false);
  const { deploy, undeploy } = useDeployment(modelVersionId);

  const onConfirmDeploy = useCallback(async () => {
    setIsDeployModalVisible(false);
    setLoading(true);
    await deploy({
      onComplete: () => {
        onComplete();
        setLoading(false);
      },
      onError: () => {
        setLoading(false);
      },
    });
  }, [deploy, onComplete]);

  const deployModal = isDeployModalVisible && (
    <EuiConfirmModal
      title={`Deploy ${modelName} version ${modelVersion}?`}
      onCancel={() => setIsDeployModalVisible(false)}
      onConfirm={onConfirmDeploy}
      confirmButtonText="Deploy"
      cancelButtonText="Cancel"
    >
      <p>This version will begin deploying.</p>
    </EuiConfirmModal>
  );

  const onConfirmUndeploy = useCallback(async () => {
    setIsUndeployModalVisible(false);
    setLoading(true);
    await undeploy();
    setLoading(false);
    onComplete();
  }, [undeploy, onComplete]);

  const undeployModal = isUndeployModalVisible && (
    <EuiConfirmModal
      title={`Undeploy ${modelName} version ${modelVersion}?`}
      onCancel={() => setIsUndeployModalVisible(false)}
      onConfirm={onConfirmUndeploy}
      confirmButtonText="Undeploy"
      cancelButtonText="Cancel"
    >
      <p>This version will be undeployed. You can deploy it again later.</p>
    </EuiConfirmModal>
  );

  const toggleButton = useMemo(() => {
    switch (modelState) {
      case MODEL_VERSION_STATE.registering:
      case MODEL_VERSION_STATE.deploying:
      case MODEL_VERSION_STATE.registerFailed:
        return undefined;
      case MODEL_VERSION_STATE.registered:
      case MODEL_VERSION_STATE.deployFailed:
      case MODEL_VERSION_STATE.undeployed:
        return (
          <EuiButton
            aria-label="deploy model"
            isLoading={loading}
            onClick={() => setIsDeployModalVisible(true)}
          >
            Deploy
          </EuiButton>
        );
      case MODEL_VERSION_STATE.deployed:
      case MODEL_VERSION_STATE.partiallyDeployed:
        return (
          <EuiButton
            aria-label="undeploy model"
            isLoading={loading}
            onClick={() => setIsUndeployModalVisible(true)}
          >
            Undeploy
          </EuiButton>
        );
      default:
        return undefined;
    }
  }, [modelState, loading]);

  return (
    <>
      {toggleButton}
      {deployModal}
      {undeployModal}
    </>
  );
};
