/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback } from 'react';
import { takeWhile, switchMap } from 'rxjs/operators';
import { timer } from 'rxjs';
import { generatePath, useHistory } from 'react-router-dom';

import {
  EuiButton,
  EuiButtonEmpty,
  EuiCodeBlock,
  EuiFlexGroup,
  EuiFlexItem,
  EuiLink,
  EuiModal,
  EuiModalBody,
  EuiModalFooter,
  EuiModalHeader,
  EuiModalHeaderTitle,
  EuiSpacer,
  EuiText,
} from '@elastic/eui';
import { isModelDeployable, isModelUndeployable, routerPaths } from '../../common';
import { APIProvider } from '../apis/api_provider';
import { useOpenSearchDashboards } from '../../../../src/plugins/opensearch_dashboards_react/public';
import { mountReactNode } from '../../../../src/core/public/utils';

export const useDeployment = (modelVersionId: string) => {
  const {
    services: { notifications, overlays },
  } = useOpenSearchDashboards();
  const history = useHistory();

  const deploy = useCallback(async () => {
    const modelVersionData = await APIProvider.getAPI('modelVersion').getOne(modelVersionId);
    const modelVersionUrl = history.createHref({
      pathname: generatePath(routerPaths.modelVersion, { id: modelVersionId }),
    });

    if (!isModelDeployable(modelVersionData.model_state)) {
      notifications?.toasts.addDanger(
        `Cannot deploy a model which is ${modelVersionData.model_state}`
      );
      return;
    }

    const taskData = await APIProvider.getAPI('modelVersion').load(modelVersionId);

    // Poll task api every 2s for the deployment status
    timer(0, 2000)
      .pipe(switchMap((_) => APIProvider.getAPI('task').getOne(taskData.task_id)))
      // continue polling when task state is CREATED or RUNNING
      .pipe(takeWhile((res) => res.state === 'CREATED' || res.state === 'RUNNING', true))
      .subscribe({
        error: () => {
          notifications?.toasts.addDanger(
            {
              title: mountReactNode(
                <EuiText>
                  <EuiLink href={modelVersionUrl}>
                    {modelVersionData.name} version {modelVersionData.model_version}
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
          if (res.state === 'COMPLETED') {
            notifications?.toasts.addSuccess({
              title: mountReactNode(
                <EuiText>
                  <EuiLink href={modelVersionUrl}>
                    {modelVersionData.name} version {modelVersionData.model_version}
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
                        {modelVersionData.name} version {modelVersionData.model_version}
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
                              mountReactNode(
                                <EuiModal onClose={() => overlayRef?.close()}>
                                  <EuiModalHeader>
                                    <EuiModalHeaderTitle>
                                      <h2>
                                        <EuiLink href={modelVersionUrl}>
                                          {modelVersionData.name} version{' '}
                                          {modelVersionData.model_version}
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
                                    <EuiButtonEmpty onClick={() => overlayRef?.close()}>
                                      Close
                                    </EuiButtonEmpty>
                                  </EuiModalFooter>
                                </EuiModal>
                              )
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
  }, [modelVersionId, history, notifications?.toasts, overlays]);

  const undeploy = useCallback(async () => {
    const modelVersionData = await APIProvider.getAPI('modelVersion').getOne(modelVersionId);

    if (!isModelUndeployable(modelVersionData.model_state)) {
      notifications?.toasts.addDanger(
        `Cannot undeploy a model which is ${modelVersionData.model_state}`
      );
      return;
    }

    const modelVersionUrl = history.createHref({
      pathname: generatePath(routerPaths.modelVersion, { id: modelVersionId }),
    });
    try {
      await APIProvider.getAPI('modelVersion').unload(modelVersionId);
      notifications?.toasts.addSuccess({
        title: mountReactNode(
          <EuiText>
            <EuiLink href={modelVersionUrl}>
              {modelVersionData.name} version {modelVersionData.model_version}
            </EuiLink>{' '}
            has been undeployed
          </EuiText>
        ),
      });
    } catch (e) {
      notifications?.toasts.addDanger(
        {
          title: mountReactNode(
            <EuiText>
              <EuiLink href={modelVersionUrl}>
                {modelVersionData.name} version {modelVersionData.model_version}
              </EuiLink>{' '}
              undeployment failed
            </EuiText>
          ),
        },
        { toastLifeTimeMs: 60000 }
      );
    }
  }, [modelVersionId, notifications?.toasts, history]);

  return { deploy, undeploy };
};
