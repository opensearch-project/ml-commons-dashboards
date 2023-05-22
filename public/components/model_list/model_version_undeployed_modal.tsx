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
  const willDeleteVersion = deployedVersion.current?.map((item) => {
    return <li>Version {item}</li>;
  });

  return (
    <EuiModal onClose={handleCancel} style={{ width: '500px' }}>
      <EuiModalHeader>
        <EuiModalHeaderTitle>
          <h1>
            Unable to delete{' '}
            {
              <EuiLink color="primary" href="#">
                {deleteIdRef.current}
              </EuiLink>
            }
          </h1>
        </EuiModalHeaderTitle>
      </EuiModalHeader>
      <EuiModalBody style={{ lineHeight: '25px' }}>
        Version of this model are currently deployed. To delete this model, undeployed following
        versions from the{' '}
        <EuiLink color="primary" href="#">
          {deleteIdRef.current}
        </EuiLink>{' '}
        page.
        {willDeleteVersion}
      </EuiModalBody>
      <EuiModalFooter>
        <EuiButton onClick={handleCancel}>Close</EuiButton>
      </EuiModalFooter>
    </EuiModal>
  );
});
