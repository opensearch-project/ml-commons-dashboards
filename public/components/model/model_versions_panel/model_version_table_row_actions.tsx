/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback } from 'react';
import { EuiPopover, EuiButtonIcon, EuiContextMenuPanel, EuiContextMenuItem } from '@elastic/eui';

import { MODEL_VERSION_STATE } from '../../../../common';
import {
  ModelVersionDeleteConfirmModal,
  ModelVersionDeploymentConfirmModal,
  ModelVersionUnableDoActionModal,
} from '../../common';

interface ModelVersionTableRowActionsProps {
  id: string;
  name: string;
  version: string;
  state: MODEL_VERSION_STATE;
  onDeleted: (id: string) => void;
  onDeployed: (id: string) => void;
  onUndeployed: (id: string) => void;
  onDeployFailed: (id: string) => void;
  onUndeployFailed: (id: string) => void;
}

export const ModelVersionTableRowActions = ({
  id,
  name,
  state,
  version,
  onDeleted,
  onDeployed,
  onDeployFailed,
  onUndeployed,
  onUndeployFailed,
}: ModelVersionTableRowActionsProps) => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [isDeployConfirmModalShow, setIsDeployConfirmModalShow] = useState(false);
  const [isUndeployConfirmModalShow, setIsUndeployConfirmModalShow] = useState(false);
  const [isDeleteConfirmModalShow, setIsDeleteConfirmModalShow] = useState(false);
  const [isUnableDeleteModalShow, setIsUnableDeleteModalShow] = useState(false);

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

  const handleDeployConfirmModalClose = useCallback(
    ({ id: versionId, succeed, canceled }: { succeed: boolean; id: string; canceled: boolean }) => {
      if (succeed) {
        onDeployed(versionId);
      }
      if (!succeed && !canceled) {
        onDeployFailed(versionId);
      }
      setIsDeployConfirmModalShow(false);
    },
    [onDeployed, onDeployFailed]
  );

  const handleUndeployConfirmModalClose = useCallback(
    ({ id: versionId, succeed, canceled }: { canceled: boolean; succeed: boolean; id: string }) => {
      if (succeed) {
        onUndeployed(versionId);
      }
      if (!succeed && !canceled) {
        onUndeployFailed(versionId);
      }
      setIsUndeployConfirmModalShow(false);
    },
    [onUndeployed, onUndeployFailed]
  );

  const handleDeleteClick = useCallback(() => {
    if (
      [
        MODEL_VERSION_STATE.deployed,
        MODEL_VERSION_STATE.deploying,
        MODEL_VERSION_STATE.registering,
      ].includes(state)
    ) {
      setIsUnableDeleteModalShow(true);
      return;
    }
    setIsDeleteConfirmModalShow(true);
  }, [state]);

  const handleDeleteConfirmModalClose = useCallback(
    (versionDeleted: boolean) => {
      setIsDeleteConfirmModalShow(false);
      if (versionDeleted) {
        onDeleted(id);
      }
    },
    [id, onDeleted]
  );

  const closeUnableDeleteModal = useCallback(() => {
    setIsUnableDeleteModalShow(false);
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
                onClick={handleDeleteClick}
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
          closeModal={handleDeployConfirmModalClose}
        />
      )}
      {isUndeployConfirmModalShow && (
        <ModelVersionDeploymentConfirmModal
          mode="undeploy"
          id={id}
          name={name}
          version={version}
          closeModal={handleUndeployConfirmModalClose}
        />
      )}
      {isDeleteConfirmModalShow && (
        <ModelVersionDeleteConfirmModal
          id={id}
          name={name}
          version={version}
          closeModal={handleDeleteConfirmModalClose}
        />
      )}
      {isUnableDeleteModalShow && (
        <ModelVersionUnableDoActionModal
          actionType="delete"
          id={id}
          name={name}
          version={version}
          state={state}
          closeModal={closeUnableDeleteModal}
        />
      )}
    </>
  );
};
