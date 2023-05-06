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
} from '@elastic/eui';
import { bus } from './bus';
export class NoIdProvideError {}
export interface ModelConfirmDeleteModalInstance {
  show: (modelId: string) => void;
}
let deployedVersion: string[] = [];
export const ModelVersionUndeployedModal = React.forwardRef<
  ModelConfirmDeleteModalInstance,
  { onDeleted: () => void }
>(({ onDeleted }, ref) => {
  const deleteIdRef = useRef<string>();
  const [visible, setVisible] = useState(false);
  const handleCancel = useCallback(() => {
    setVisible(false);
    deleteIdRef.current = undefined;
  }, []);
  useImperativeHandle(
    ref,
    () => ({
      show: (id: string) => {
        deleteIdRef.current = id;
        setVisible(true);
      },
    }),
    []
  );
  function receiveVal() {
    bus.on('sendVersions', (data) => {
      deployedVersion = data;
    });
  }
  receiveVal();
  if (!visible) {
    return null;
  }
  const curModel = (
    <a href="xxx" style={{ color: 'blue' }}>
      {deleteIdRef.current}
    </a>
  );
  const willDeleteVersion = deployedVersion
    .slice(0, -1)
    .join(',')
    .concat(' and ' + deployedVersion[deployedVersion.length - 1]);
  return (
    <EuiModal onClose={handleCancel} style={{ width: '500px' }}>
      <EuiModalHeader>
        <EuiModalHeaderTitle>
          <h1>{deployedVersion.length} Versions must be undeployed to delete this model.</h1>
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
