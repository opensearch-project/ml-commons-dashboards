/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Link, generatePath } from 'react-router-dom';
import {
  EuiButtonEmpty,
  EuiLink,
  EuiModal,
  EuiModalBody,
  EuiModalFooter,
  EuiModalHeader,
  EuiText,
  EuiTitle,
} from '@elastic/eui';
import { MODEL_VERSION_STATE, routerPaths } from '../../../../common';

const mapping: {
  ['delete']: {
    [key in MODEL_VERSION_STATE]?: (modelVersionNode: React.ReactNode) => React.ReactNode;
  };
  ['edit']: {
    [key in MODEL_VERSION_STATE]?: (modelVersionNode: React.ReactNode) => React.ReactNode;
  };
} = {
  delete: {
    [MODEL_VERSION_STATE.deployed]: (modelVersionNode: React.ReactNode) => (
      <>
        This version is currently deployed. To delete this version, undeploy it on the
        {modelVersionNode} page.
      </>
    ),
    [MODEL_VERSION_STATE.registering]: (_modelVersionNode: React.ReactNode) => (
      <>
        This version is uploading. Wait for this version to complete uploading and then try again.
      </>
    ),
    [MODEL_VERSION_STATE.deploying]: (modelVersionNode: React.ReactNode) => (
      <>
        To delete this version, wait for it to complete deploying and then undeploy it on the
        {modelVersionNode} page.
      </>
    ),
  },
  edit: {
    [MODEL_VERSION_STATE.deployed]: (modelVersionNode: React.ReactNode) => (
      <>
        This version is currently deployed. To edit this version, undeploy it on the{' '}
        {modelVersionNode} page.
      </>
    ),
    [MODEL_VERSION_STATE.registering]: (_modelVersionNode: React.ReactNode) => (
      <>Wait for this version to complete uploading and then try again.</>
    ),
    [MODEL_VERSION_STATE.deploying]: (modelVersionNode: React.ReactNode) => (
      <>
        To edit this version, wait for it to complete deploying and then undeploy it on the
        {modelVersionNode} page.
      </>
    ),
  },
};

interface ModelVersionUnableDoActionModalProps {
  id: string;
  name: string;
  version: string;
  state: MODEL_VERSION_STATE;
  actionType: 'edit' | 'delete';
  closeModal: () => void;
}

export const ModelVersionUnableDoActionModal = ({
  id,
  name,
  state,
  version,
  closeModal,
  actionType,
}: ModelVersionUnableDoActionModalProps) => {
  const modeVersionLinkNode = (
    <Link to={generatePath(routerPaths.modelVersion, { id })}>
      <EuiLink>
        {name} version {version}
      </EuiLink>
    </Link>
  );

  return (
    <EuiModal maxWidth={500} style={{ maxWidth: 500 }} onClose={closeModal}>
      <EuiModalHeader>
        <EuiTitle>
          <h2>
            Unable to {actionType} {modeVersionLinkNode}
          </h2>
        </EuiTitle>
      </EuiModalHeader>
      <EuiModalBody>
        <EuiText>{mapping[actionType][state]?.(modeVersionLinkNode)}</EuiText>
      </EuiModalBody>
      <EuiModalFooter>
        <EuiButtonEmpty onClick={closeModal}>Close</EuiButtonEmpty>
      </EuiModalFooter>
    </EuiModal>
  );
};
