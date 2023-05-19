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

const mode2ErrorTitleMap = {
  'deployment-failed': 'deployment failed',
  'artifact-upload-failed': 'artifact upload failed',
};

export const ModelVersionErrorDetailsModal = ({
  id,
  mode,
  name,
  version,
  closeModal,
  errorDetails,
}: {
  id: string;
  mode: 'deployment-failed' | 'artifact-upload-failed';
  name: string;
  version: string;
  closeModal: () => void;
  errorDetails: string;
}) => {
  const errorTitle = mode2ErrorTitleMap[mode];
  return (
    <EuiModal style={{ width: 520 }} onClose={closeModal}>
      <EuiModalHeader>
        <EuiModalHeaderTitle>
          <EuiTitle>
            <h2>
              <Link component={EuiLink} to={generatePath(routerPaths.modelVersion, { id })}>
                {name} version {version}
              </Link>{' '}
              {errorTitle}
            </h2>
          </EuiTitle>
        </EuiModalHeaderTitle>
      </EuiModalHeader>
      <EuiModalBody>
        {mode === 'deployment-failed' ? (
          <>
            <EuiText size="s">Error message:</EuiText>
            <EuiSpacer size="m" />
            <EuiCodeBlock isCopyable={true}>{errorDetails}</EuiCodeBlock>
          </>
        ) : (
          <EuiText style={{ padding: '8px 0' }} size="s">
            <p style={{ wordBreak: 'break-all' }}>{errorDetails}</p>
          </EuiText>
        )}
      </EuiModalBody>
      <EuiModalFooter>
        <EuiButtonEmpty onClick={closeModal}>Close</EuiButtonEmpty>
      </EuiModalFooter>
    </EuiModal>
  );
};
