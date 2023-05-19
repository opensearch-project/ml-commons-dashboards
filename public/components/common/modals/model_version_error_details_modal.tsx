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
  'undeployment-failed': 'undeployment failed',
};

export const ModelVersionErrorDetailsModal = ({
  id,
  mode,
  name,
  version,
  closeModal,
  errorDetails,
  plainVersionLink,
}: {
  id: string;
  mode: 'deployment-failed' | 'artifact-upload-failed' | 'undeployment-failed';
  name: string;
  version: string;
  closeModal: () => void;
  errorDetails: string;
  plainVersionLink?: string;
}) => {
  const errorTitle = mode2ErrorTitleMap[mode];
  const linkText = `${name} version ${version}`;

  return (
    <EuiModal style={{ width: 520 }} onClose={closeModal}>
      <EuiModalHeader>
        <EuiModalHeaderTitle>
          <EuiTitle>
            <h2>
              {plainVersionLink ? (
                <EuiLink href={plainVersionLink}>{linkText}</EuiLink>
              ) : (
                <Link component={EuiLink} to={generatePath(routerPaths.modelVersion, { id })}>
                  {linkText}
                </Link>
              )}{' '}
              {errorTitle}
            </h2>
          </EuiTitle>
        </EuiModalHeaderTitle>
      </EuiModalHeader>
      <EuiModalBody>
        {mode === 'deployment-failed' || mode === 'undeployment-failed' ? (
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
