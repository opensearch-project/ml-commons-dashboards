/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { htmlIdGenerator, EuiSpacer, EuiText, EuiRadio, EuiLink } from '@elastic/eui';

import { ModelFileUploader, UploadHelpText } from '../common/forms/artifact_file';
import { ModelArtifactUrl } from '../common/forms/artifact_url';
import { ModelFileFormatSelect } from '../common/forms/model_file_format';

export const ArtifactPanel = () => {
  const [selectedSource, setSelectedSource] = useState<'source_from_computer' | 'source_from_url'>(
    'source_from_computer'
  );

  return (
    <div>
      <EuiText size="s">
        <h3>Artifact</h3>
      </EuiText>
      <EuiText style={{ maxWidth: 725 }}>
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
      {selectedSource === 'source_from_url' && <ModelArtifactUrl />}
      <EuiSpacer size="xs" />
      <UploadHelpText />
      <EuiSpacer />
      <ModelFileFormatSelect />
    </div>
  );
};
