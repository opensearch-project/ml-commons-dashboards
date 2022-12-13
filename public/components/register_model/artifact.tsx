import React, { useState } from 'react';
import {
  EuiFormRow,
  EuiPanel,
  EuiTitle,
  EuiHorizontalRule,
  htmlIdGenerator,
  EuiSpacer,
  EuiFlexGroup,
  EuiFlexItem,
  EuiCheckableCard,
} from '@elastic/eui';
import type { Control } from 'react-hook-form';

import { FORM_ITEM_WIDTH } from './form_constants';
import { RegisterModelFormData } from './register_model.types';
import { ModelFileUploader } from './artifact_file';
import { ArtifactUrl } from './artifact_url';

export const ArtifactPanel: React.FC<{ formControl: Control<RegisterModelFormData> }> = (props) => {
  const [selectedSource, setSelectedSource] = useState<'source_from_computer' | 'source_from_url'>(
    'source_from_computer'
  );

  return (
    <>
      <EuiPanel>
        <EuiTitle size="s">
          <h3>Artifact</h3>
        </EuiTitle>
        <EuiHorizontalRule margin="m" />
        <EuiFormRow fullWidth style={{ maxWidth: FORM_ITEM_WIDTH * 2 }} label="Model file source">
          <EuiFlexGroup>
            <EuiFlexItem>
              <EuiCheckableCard
                id={htmlIdGenerator()()}
                name="modelSource"
                label="From computer"
                value="source_from_computer"
                checked={selectedSource === 'source_from_computer'}
                onChange={() => setSelectedSource('source_from_computer')}
              />
            </EuiFlexItem>
            <EuiFlexItem>
              <EuiCheckableCard
                id={htmlIdGenerator()()}
                name="modelSource"
                label="From URL"
                value="source_from_url"
                checked={selectedSource === 'source_from_url'}
                onChange={() => setSelectedSource('source_from_url')}
              />
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiFormRow>
        <EuiSpacer size="m" />
        {selectedSource === 'source_from_computer' && (
          <ModelFileUploader formControl={props.formControl} />
        )}
        {selectedSource === 'source_from_url' && <ArtifactUrl formControl={props.formControl} />}
      </EuiPanel>
    </>
  );
};
