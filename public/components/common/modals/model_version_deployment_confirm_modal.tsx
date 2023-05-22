/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useState } from 'react';
import {
  EuiButton,
  EuiConfirmModal,
  EuiFlexGroup,
  EuiFlexItem,
  EuiLink,
  EuiSpacer,
  EuiText,
} from '@elastic/eui';
import { Link, generatePath, useHistory } from 'react-router-dom';

import { useOpenSearchDashboards } from '../../../../../../src/plugins/opensearch_dashboards_react/public';
import { mountReactNode } from '../../../../../../src/core/public/utils';
import { routerPaths } from '../../../../common';
import { APIProvider } from '../../../apis/api_provider';

import { ModelVersionErrorDetailsModal } from './model_version_error_details_modal';

export const ModelVersionDeploymentConfirmModal = ({
  id,
  mode,
  name,
  version,
  closeModal,
}: {
  id: string;
  mode: 'deploy' | 'undeploy';
  name: string;
  version: string;
  closeModal: () => void;
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    services: { notifications, overlays },
  } = useOpenSearchDashboards();
  const isDeployMode = mode === 'deploy';
  const history = useHistory();

  const handleConfirm = useCallback(async () => {
    setIsSubmitting(true);
    let result;
    const modelVersionUrl = history.createHref({
      pathname: generatePath(routerPaths.modelVersion, { id }),
    });
    try {
      result = await (isDeployMode
        ? APIProvider.getAPI('model').load
        : APIProvider.getAPI('model').unload)(id);
    } catch (e) {
      notifications?.toasts.addDanger({
        title: mountReactNode(
          <>
            <EuiLink href={modelVersionUrl}>
              {name} version {version}
            </EuiLink>
            .
          </>
        ),
        text: mountReactNode(
          <>
            <EuiText>{isDeployMode ? 'deployment failed.' : 'undeployment failed.'}</EuiText>
            <EuiSpacer size="xs" />
            <EuiSpacer size="s" />
            <EuiFlexGroup justifyContent="flexEnd">
              <EuiFlexItem grow={false}>
                <EuiButton
                  color="danger"
                  onClick={() => {
                    const overlayRef = overlays?.openModal(
                      mountReactNode(
                        <ModelVersionErrorDetailsModal
                          id={id}
                          name={name}
                          version={version}
                          plainVersionLink={modelVersionUrl}
                          mode={isDeployMode ? 'deployment-failed' : 'undeployment-failed'}
                          closeModal={() => {
                            overlayRef?.close();
                          }}
                          errorDetails={e instanceof Error ? e.message : JSON.stringify(e)}
                        />
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
      });
      return;
    } finally {
      setIsSubmitting(false);
      closeModal();
    }
    // The undeploy API call is sync, we can show error message after immediately
    if (!isDeployMode) {
      notifications?.toasts.addSuccess({
        title: mountReactNode(
          <>
            Undeployed{' '}
            <EuiLink href={modelVersionUrl}>
              {name} version {version}
            </EuiLink>
            .
          </>
        ),
      });
    }
    // TODO: Implement model version table status updated after integrate model version table automatic refresh status column
  }, [id, notifications, isDeployMode, closeModal, overlays, history, name, version]);

  return (
    <EuiConfirmModal
      title={
        <>
          {isDeployMode ? 'Deploy' : 'Undeploy'}{' '}
          <Link to={generatePath(routerPaths.modelVersion, { id })} component={EuiLink}>
            {name} version {version}
          </Link>
        </>
      }
      confirmButtonText={isDeployMode ? 'Deploy' : 'Undeploy'}
      cancelButtonText="Cancel"
      onCancel={closeModal}
      onConfirm={handleConfirm}
      confirmButtonDisabled={isSubmitting}
      isLoading={isSubmitting}
      maxWidth={500}
    >
      {isDeployMode
        ? 'This version will begin deploying.'
        : 'This version will be undeployed. You can deploy it again later.'}
    </EuiConfirmModal>
  );
};
