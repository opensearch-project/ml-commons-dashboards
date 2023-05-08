/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

import { generatePath, Link } from 'react-router-dom';
import {
  EuiModal,
  EuiModalHeader,
  EuiModalBody,
  EuiModalHeaderTitle,
  EuiModalFooter,
  EuiTitle,
  EuiButtonEmpty,
  EuiText,
  EuiLink,
  EuiCodeBlock,
  EuiSpacer,
} from '@elastic/eui';

import { routerPaths } from '../../../../common/router_paths';

export const ModelVersionErrorDetailModal = ({
  id,
  name,
  version,
  closeModal,
  errorDetail,
  isDeployFailed,
}: {
  name: string;
  id: string;
  version: string;
  closeModal: () => void;
  errorDetail: string;
  isDeployFailed?: boolean;
}) => {
  return (
    <EuiModal style={{ width: 520 }} onClose={closeModal}>
      <EuiModalHeader>
        <EuiModalHeaderTitle>
          <EuiTitle>
            <h2>
              <Link component={EuiLink} to={generatePath(routerPaths.modelVersion, { id })}>
                {name} version {version}
              </Link>{' '}
              {isDeployFailed ? 'deployment failed' : 'artifact upload failed'}
            </h2>
          </EuiTitle>
        </EuiModalHeaderTitle>
      </EuiModalHeader>
      <EuiModalBody>
        {isDeployFailed ? (
          <>
            <EuiText size="s">Error message:</EuiText>
            <EuiSpacer size="m" />
            <EuiCodeBlock isCopyable={true}>{errorDetail}</EuiCodeBlock>
          </>
        ) : (
          <EuiText style={{ padding: '8px 0' }} size="s">
            <p style={{ wordBreak: 'break-all' }}>{errorDetail}</p>
          </EuiText>
        )}
      </EuiModalBody>
      <EuiModalFooter>
        <EuiButtonEmpty onClick={closeModal}>Close</EuiButtonEmpty>
      </EuiModalFooter>
    </EuiModal>
  );
};
