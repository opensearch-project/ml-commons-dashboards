/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState } from 'react';
import { takeWhile, switchMap } from 'rxjs/operators';
import { timer } from 'rxjs';
import {
  EuiButton,
  EuiConfirmModal,
  EuiFlexGroup,
  EuiFlexItem,
  EuiText,
  EuiSpacer,
  EuiModal,
  EuiModalHeader,
  EuiModalHeaderTitle,
  EuiModalBody,
  EuiCodeBlock,
  EuiModalFooter,
  EuiButtonEmpty,
  EuiLink,
} from '@elastic/eui';

import { generatePath, useHistory } from 'react-router-dom';
import { MODEL_VERSION_STATE } from '../../../common';
import { routerPaths } from '../../../common';
import { APIProvider } from '../../apis/api_provider';
import { useOpenSearchDashboards } from '../../../../../src/plugins/opensearch_dashboards_react/public';
import { mountReactNode } from '../../../../../src/core/public/utils';

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
  onComplete: (id: string) => void;
  // called when deploy or undeploy encountered error
  onError: (id: string) => void;
}

export const ToggleDeployButton = ({
  modelState,
  modelName,
  modelVersion,
  modelVersionId,
  onComplete,
  onError,
}: Props) => {
  const {
    services: { notifications },
    overlays,
  } = useOpenSearchDashboards();
  const [loading, setLoading] = useState(false);
  const [isDeployModalVisible, setIsDeployModalVisible] = useState(false);
  const [isUndeployModalVisible, setIsUndeployModalVisible] = useState(false);
  const history = useHistory();
  const modelVersionUrl = history.createHref({
    pathname: generatePath(routerPaths.modelVersion, { id: modelVersionId }),
  });

  const onDeploy = async (id: string) => {
    setLoading(true);
    const { task_id: taskId } = await APIProvider.getAPI('modelVersion').load(id);

    // Poll task api every 2s for the deployment status
    timer(0, 2000)
      .pipe(switchMap((_) => APIProvider.getAPI('task').getOne(taskId)))
      // continue polling when task state is CREATED or RUNNING
      .pipe(takeWhile((res) => res.state === 'CREATED' || res.state === 'RUNNING', true))
      .subscribe({
        error: () => {
          onError(modelVersionId);
          setLoading(false);
          notifications?.toasts.addDanger(
            {
              title: mountReactNode(
                <EuiText>
                  <EuiLink href={modelVersionUrl}>
                    {modelName} version {modelVersion}
                  </EuiLink>{' '}
                  deployment failed.
                </EuiText>
              ),
              text: 'Network error',
            },
            { toastLifeTimeMs: 60000 }
          );
        },
        next: (res) => {
          onComplete(modelVersionId);
          setLoading(false);
          if (res.state === 'COMPLETED') {
            notifications?.toasts.addSuccess({
              title: mountReactNode(
                <EuiText>
                  <EuiLink href={modelVersionUrl}>
                    {modelName} version {modelVersion}
                  </EuiLink>{' '}
                  has been deployed.
                </EuiText>
              ),
            });
          } else if (res.state === 'FAILED') {
            notifications?.toasts.addDanger(
              {
                title: mountReactNode(
                  <>
                    <EuiText>
                      <EuiLink href={modelVersionUrl}>
                        {modelName} version {modelVersion}
                      </EuiLink>{' '}
                      deployment failed.
                    </EuiText>
                    <EuiSpacer />
                    <EuiFlexGroup justifyContent="flexEnd">
                      <EuiFlexItem grow={false}>
                        <EuiButton
                          color="danger"
                          onClick={() => {
                            const overlayRef = overlays?.openModal(
                              <EuiModal onClose={() => overlayRef.close()}>
                                <EuiModalHeader>
                                  <EuiModalHeaderTitle>
                                    <h2>
                                      <EuiLink href={modelVersionUrl}>
                                        {modelName} version {modelVersion}
                                      </EuiLink>{' '}
                                      deployment failed
                                    </h2>
                                  </EuiModalHeaderTitle>
                                </EuiModalHeader>
                                <EuiModalBody>
                                  <EuiText size="s">Error message:</EuiText>
                                  <EuiSpacer size="m" />
                                  <EuiCodeBlock isCopyable={true}>
                                    {res.error ?? 'Unknown error'}
                                  </EuiCodeBlock>
                                </EuiModalBody>
                                <EuiModalFooter>
                                  <EuiButtonEmpty onClick={() => overlayRef.close()}>
                                    Close
                                  </EuiButtonEmpty>
                                </EuiModalFooter>
                              </EuiModal>
                            );
                          }}
                        >
                          See full error
                        </EuiButton>
                      </EuiFlexItem>
                    </EuiFlexGroup>
                  </>
                ),
              },
              { toastLifeTimeMs: 60000 }
            );
          }
        },
      });
  };

  const onUndeploy = async (id: string) => {
    try {
      setLoading(true);
      await APIProvider.getAPI('modelVersion').unload(id);
      notifications?.toasts.addSuccess({
        title: mountReactNode(
          <EuiText>
            <EuiLink href={modelVersionUrl}>
              {modelName} version {modelVersion}
            </EuiLink>{' '}
            has been undeployed
          </EuiText>
        ),
      });
      onComplete(modelVersionId);
    } catch (e) {
      onError(modelVersionId);
      notifications?.toasts.addDanger(
        {
          title: mountReactNode(
            <EuiText>
              <EuiLink href={modelVersionUrl}>
                {modelName} version {modelVersion}
              </EuiLink>{' '}
              undeployment failed
            </EuiText>
          ),
        },
        { toastLifeTimeMs: 60000 }
      );
    } finally {
      setLoading(false);
    }
  };

  const deployModal = isDeployModalVisible && (
    <EuiConfirmModal
      title={`Deploy ${modelName} version ${modelVersion}?`}
      onCancel={() => setIsDeployModalVisible(false)}
      onConfirm={() => {
        onDeploy(modelVersionId);
        setIsDeployModalVisible(false);
      }}
      confirmButtonText="Deploy"
      cancelButtonText="Cancel"
    >
      <p>This version will begin deploying.</p>
    </EuiConfirmModal>
  );

  const undeployModal = isUndeployModalVisible && (
    <EuiConfirmModal
      title={`Undeploy ${modelName} version ${modelVersion}?`}
      onCancel={() => setIsUndeployModalVisible(false)}
      onConfirm={() => {
        onUndeploy(modelVersionId);
        setIsUndeployModalVisible(false);
      }}
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
