/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useImperativeHandle, useRef, useState } from 'react';
import {
  EuiButton,
  EuiModal,
  EuiModalBody,
  EuiModalFooter,
  EuiModalHeader,
  EuiModalHeaderTitle,
  EuiLink,
} from '@elastic/eui';
export class NoIdProvideError {}
export interface ModelConfirmDeleteModalInstance {
  show: (modelId: string, deployedVersions: string[], name: string) => void;
}
// let deployedVersion: string[] = [];
export const ModelVersionUndeployedModal = React.forwardRef<
  ModelConfirmDeleteModalInstance,
  { onDeleted: () => void }
>(({ onDeleted }, ref) => {
  const deleteIdRef = useRef<string>();
  const deployedVersion = useRef<string[]>();
  const [visible, setVisible] = useState(false);
  const handleCancel = useCallback(() => {
    setVisible(false);
    deleteIdRef.current = undefined;
  }, []);
  useImperativeHandle(
    ref,
    () => ({
      show: (id: string, deployedVersions: string[]) => {
        deleteIdRef.current = id;
        deployedVersion.current = deployedVersions;
        setVisible(true);
      },
    }),
    []
  );
  if (!visible) {
    return null;
  }
  const curModel = (
    <EuiLink color="primary" href="#">
      {deleteIdRef.current}
    </EuiLink>
  );
  const willDeleteVersion = deployedVersion.current
    ?.slice(0, -1)
    .join(',')
    .concat(' and ' + deployedVersion.current[deployedVersion.current?.length - 1]);
  return (
    <EuiModal onClose={handleCancel} style={{ width: '500px' }}>
      <EuiModalHeader>
        <EuiModalHeaderTitle>
          <h1>
            {deployedVersion.current?.length} Versions must be undeployed to delete this model.
          </h1>
        </EuiModalHeaderTitle>
      </EuiModalHeader>
      <EuiModalBody style={{ lineHeight: '25px' }}>
        Versions {willDeleteVersion} of this model are deployed. They must be undeployed to delete
        this model. See {curModel} to undeploy these versions.
      </EuiModalBody>
      <EuiModalFooter>
        <EuiButton onClick={handleCancel}>Close</EuiButton>
      </EuiModalFooter>
    </EuiModal>
  );
});
