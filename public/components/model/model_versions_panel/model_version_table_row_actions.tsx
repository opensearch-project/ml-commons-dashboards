/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback } from 'react';
import { EuiPopover, EuiButtonIcon, EuiContextMenuPanel, EuiContextMenuItem } from '@elastic/eui';

import { MODEL_VERSION_STATE } from '../../../../common';
import { ModelVersionDeploymentConfirmModal } from '../../common';

export const ModelVersionTableRowActions = ({
  state,
  id,
  name,
  version,
}: {
  state: MODEL_VERSION_STATE;
  id: string;
  name: string;
  version: string;
}) => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [isDeployConfirmModalShow, setIsDeployConfirmModalShow] = useState(false);
  const [isUndeployConfirmModalShow, setIsUndeployConfirmModalShow] = useState(false);

  const handleShowActionsClick = useCallback(() => {
    setIsPopoverOpen((flag) => !flag);
  }, []);

  const closePopover = useCallback(() => {
    setIsPopoverOpen(false);
  }, []);

  const handleDeployClick = useCallback(() => {
    setIsDeployConfirmModalShow(true);
  }, []);

  const handleUndeployClick = useCallback(() => {
    setIsUndeployConfirmModalShow(true);
  }, []);

  const closeDeployConfirmModal = useCallback(() => {
    setIsDeployConfirmModalShow(false);
  }, []);

  const closeUndeployConfirmModal = useCallback(() => {
    setIsUndeployConfirmModalShow(false);
  }, []);

  return (
    <>
      <EuiPopover
        isOpen={isPopoverOpen}
        panelPaddingSize="none"
        anchorPosition="downCenter"
        button={
          <EuiButtonIcon
            aria-label="show actions"
            iconType="boxesHorizontal"
            color="text"
            onClick={handleShowActionsClick}
          />
        }
        closePopover={closePopover}
        ownFocus={false}
      >
        <div style={{ width: 192 }}>
          <EuiContextMenuPanel
            onClick={closePopover}
            items={[
              ...(state === MODEL_VERSION_STATE.registerFailed
                ? [
                    <EuiContextMenuItem
                      key="upload-new-artifact"
                      icon="exportAction"
                      style={{ padding: 8 }}
                    >
                      Upload new artifact
                    </EuiContextMenuItem>,
                  ]
                : []),
              ...(state === MODEL_VERSION_STATE.registered ||
              state === MODEL_VERSION_STATE.undeployed ||
              state === MODEL_VERSION_STATE.deployFailed
                ? [
                    <EuiContextMenuItem
                      key="deploy"
                      icon="exportAction"
                      style={{ padding: 8 }}
                      onClick={handleDeployClick}
                    >
                      Deploy
                    </EuiContextMenuItem>,
                  ]
                : []),
              ...(state === MODEL_VERSION_STATE.deployed ||
              state === MODEL_VERSION_STATE.partiallyDeployed
                ? [
                    <EuiContextMenuItem
                      key="undeploy"
                      icon="importAction"
                      style={{ padding: 8 }}
                      onClick={handleUndeployClick}
                    >
                      Undeploy
                    </EuiContextMenuItem>,
                  ]
                : []),
              <EuiContextMenuItem
                key="delete"
                icon="trash"
                color="danger"
                style={{ padding: 8, color: '#BD271E' }}
              >
                Delete
              </EuiContextMenuItem>,
            ]}
          />
        </div>
      </EuiPopover>
      {isDeployConfirmModalShow && (
        <ModelVersionDeploymentConfirmModal
          mode="deploy"
          id={id}
          name={name}
          version={version}
          closeModal={closeDeployConfirmModal}
        />
      )}
      {isUndeployConfirmModalShow && (
        <ModelVersionDeploymentConfirmModal
          mode="undeploy"
          id={id}
          name={name}
          version={version}
          closeModal={closeUndeployConfirmModal}
        />
      )}
    </>
  );
};
