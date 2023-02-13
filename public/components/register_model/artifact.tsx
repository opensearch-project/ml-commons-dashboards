/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { EuiTitle, htmlIdGenerator, EuiSpacer, EuiText, EuiRadio, EuiLink } from '@elastic/eui';

import { ModelFileUploader } from './artifact_file';
import { ArtifactUrl } from './artifact_url';

export const ArtifactPanel = () => {
  const [selectedSource, setSelectedSource] = useState<'source_from_computer' | 'source_from_url'>(
    'source_from_computer'
  );

  return (
    <div>
      <EuiTitle size="s">
        <h3>Artifact</h3>
      </EuiTitle>
      <EuiText style={{ maxWidth: 450 }}>
        <small>
          Provide the model artifact for upload. If uploading from local file, keep your browser
          open until the upload is complete.{' '}
          <EuiLink href="http://www.example.com" external>
            Learn more
          </EuiLink>
        </small>
      </EuiText>
      <EuiSpacer size="m" />
      <EuiRadio
        id={htmlIdGenerator()()}
        name="modelSource"
        label="From computer"
        value="source_from_computer"
        checked={selectedSource === 'source_from_computer'}
        onChange={() => setSelectedSource('source_from_computer')}
      />
      <EuiRadio
        id={htmlIdGenerator()()}
        name="modelSource"
        label="From URL"
        value="source_from_url"
        checked={selectedSource === 'source_from_url'}
        onChange={() => setSelectedSource('source_from_url')}
      />
      <EuiSpacer size="m" />
      {selectedSource === 'source_from_computer' && <ModelFileUploader />}
      {selectedSource === 'source_from_url' && <ArtifactUrl />}
    </div>
  );
};
