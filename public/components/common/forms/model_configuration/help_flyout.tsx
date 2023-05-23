/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  EuiTitle,
  EuiSpacer,
  EuiText,
  EuiFlyout,
  EuiFlyoutHeader,
  EuiFlyoutBody,
  EuiCodeBlock,
} from '@elastic/eui';

interface Props {
  onClose: () => void;
}

export const HelpFlyout = ({ onClose }: Props) => {
  const jsonCode = `
  "model_type": "bert",
  "embedding_dimension": 384,
  "framework_type": "sentence_transformers"
`;

  return (
    <EuiFlyout ownFocus onClose={onClose} aria-labelledby="flyoutTitle">
      <EuiFlyoutHeader hasBorder>
        <EuiTitle size="m">
          <h2 id="flyoutTitle">Help</h2>
        </EuiTitle>
      </EuiFlyoutHeader>
      <EuiFlyoutBody>
        <EuiTitle size="s">
          <h3 id="flyoutBodyTitle">Example</h3>
        </EuiTitle>
        <EuiSpacer />
        <EuiText>
          <p>
            For consistency across the many flyouts, please utilize the following code for
            implementing the flyout with a header.
          </p>
        </EuiText>
        <EuiSpacer />
        <EuiCodeBlock language="json" isCopyable>
          {jsonCode}
        </EuiCodeBlock>
      </EuiFlyoutBody>
    </EuiFlyout>
  );
};
