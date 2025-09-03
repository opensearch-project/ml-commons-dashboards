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

const errorType2ErrorTitleMap = {
  'deployment-failed': 'deployment failed',
  'artifact-upload-failed': 'artifact upload failed',
  'undeployment-failed': 'undeployment failed',
};

export const ModelVersionErrorDetailsModal = ({
  id,
  name,
  version,
  errorType,
  closeModal,
  errorDetails,
  plainVersionLink,
}: {
  id: string;
  name: string;
  version: string;
  errorType: 'deployment-failed' | 'artifact-upload-failed' | 'undeployment-failed';
  closeModal: () => void;
  errorDetails: string;
  plainVersionLink?: string;
}) => {
  const errorTitle = errorType2ErrorTitleMap[errorType];
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
        {errorType === 'deployment-failed' || errorType === 'undeployment-failed' ? (
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
