/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { EuiTitle, htmlIdGenerator, EuiSpacer, EuiText, EuiRadio, EuiLink } from '@elastic/eui';
import { MAX_MODEL_FILE_SIZE, ModelFileUploader } from './artifact_file';
import { ArtifactUrl } from './artifact_url';
import { ONE_GB } from '../../../common/constant';
export const ArtifactPanel = () => {
  const [selectedSource, setSelectedSource] = useState<'source_from_computer' | 'source_from_url'>(
    'source_from_computer'
  );
  return (
    <div>
      <EuiTitle size="m">
        <h1>File and version information</h1>
      </EuiTitle>
      <EuiTitle size="s">
        <h3>Artifact</h3>
      </EuiTitle>
      <EuiText style={{ maxWidth: 450 }}>
        <small>
          The zipped artifact must include a model file and a tokenizer file. If uploading with a
          local file, keep this browser open util the upload completes.{' '}
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
      <EuiSpacer size="xs" />
      <EuiText size="xs" color="subdued">
        Accepted file format: ZIP (.zip). Maximum size, {MAX_MODEL_FILE_SIZE / ONE_GB}GB.
      </EuiText>
      <EuiText size="xs" color="subdued">
        The ZIP mush include the following contents:
        <ul>
          <li>Model File, accepted formats: Torchscript(.pt), ONNX(.onnx)</li>
          <li>Tokenizer file, accepted format: JSON(.json)</li>
        </ul>
      </EuiText>
    </div>
  );
};
