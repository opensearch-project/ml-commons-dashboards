/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiHorizontalRule,
  EuiPanel,
  EuiSpacer,
  EuiTitle,
  EuiButton,
  EuiText,
  EuiLink,
  EuiCode,
} from '@elastic/eui';
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useFormContext, useFormState, useWatch } from 'react-hook-form';
import { ModelFileUploader, UploadHelpText } from '../common/forms/artifact_file';
import { ModelArtifactUrl } from '../common/forms/artifact_url';
import { ModelConfiguration } from '../common/forms/model_configuration';
import { ModelFileFormatSelect } from '../common/forms/model_file_format';
import { ModelVersionFormData } from './types';
import { VersionArtifactSource } from './version_artifact_source';

export const ModelVersionArtifact = () => {
  const form = useFormContext<ModelVersionFormData>();
  // Returned formState is wrapped with Proxy to improve render performance and
  // skip extra computation if specific state is not subscribed, so make sure you
  // deconstruct or read it before render in order to enable the subscription.
  const { defaultValues } = useFormState({ control: form.control });
  const [readOnly, setReadOnly] = useState(true);
  const formRef = useRef(form);
  formRef.current = form;

  const artifactSource = useWatch({
    name: 'artifactSource',
    control: form.control,
  });

  const onCancel = useCallback(() => {
    formRef.current.reset();
    setReadOnly(true);
  }, []);

  useEffect(() => {
    // reset form value to default when component unmounted, this makes sure
    // the unsaved changes are dropped when the component unmounted
    return () => {
      formRef.current.reset();
    };
  }, []);

  const renderArtifactInput = () => {
    if (artifactSource === 'source_not_changed') {
      if (defaultValues && defaultValues.modelFile) {
        return <ModelFileUploader label="Uploaded artifact details(file)" readOnly />;
      }
      if (defaultValues && defaultValues.modelURL) {
        return <ModelArtifactUrl readOnly label="Uploaded artifact details(URL)" />;
      }
    }
    if (artifactSource === 'source_from_computer') {
      return <ModelFileUploader />;
    }
    if (artifactSource === 'source_from_url') {
      return <ModelArtifactUrl />;
    }
  };

  return (
    <EuiPanel data-test-subj="ml-versionArtifactPanel" style={{ padding: 20 }}>
      <EuiFlexGroup alignItems="center">
        <EuiFlexItem>
          <EuiTitle size="s">
            <h3>Artifact and configuration</h3>
          </EuiTitle>
        </EuiFlexItem>
        <EuiFlexItem style={{ marginLeft: 'auto', flexGrow: 0 }}>
          {readOnly ? (
            <EuiButton aria-label="edit version artifact" onClick={() => setReadOnly(false)}>
              Edit
            </EuiButton>
          ) : (
            <EuiButton aria-label="cancel edit version artifact" onClick={onCancel}>
              Cancel
            </EuiButton>
          )}
        </EuiFlexItem>
      </EuiFlexGroup>
      <EuiSpacer size="m" />
      <EuiHorizontalRule margin="none" />
      <EuiSpacer size="m" />
      <EuiFlexGroup>
        <EuiFlexItem style={{ minWidth: 372, flexGrow: 0 }}>
          <EuiText>
            <h4>Artifact</h4>
            <small>
              The zipped artifact must include a model file and a tokenizer file. If uploading with
              a local file, keep this browser open until the upload completes.{' '}
              <EuiLink external href="http://todo">
                Learn more
              </EuiLink>
            </small>
          </EuiText>
        </EuiFlexItem>
        <EuiFlexItem>
          {!readOnly && (
            <>
              <VersionArtifactSource />
              <EuiSpacer size="m" />
            </>
          )}
          {renderArtifactInput()}
          {!readOnly && artifactSource !== 'source_not_changed' && (
            <>
              <EuiSpacer size="m" />
              <UploadHelpText />
            </>
          )}
          <EuiSpacer size="m" />
          <ModelFileFormatSelect readOnly={artifactSource === 'source_not_changed'} />
        </EuiFlexItem>
      </EuiFlexGroup>
      <EuiSpacer size="m" />
      <EuiFlexGroup>
        <EuiFlexItem style={{ minWidth: 372, flexGrow: 0 }}>
          <EuiText>
            <h4>Configuration</h4>
            <small>
              The model configuration specifies the <EuiCode>model_type</EuiCode>,{' '}
              <EuiCode>embedding_dimension</EuiCode>, and <EuiCode>framework_type</EuiCode> of the
              model.
            </small>
          </EuiText>
        </EuiFlexItem>
        <EuiFlexItem>
          <ModelConfiguration readOnly={readOnly} />
        </EuiFlexItem>
      </EuiFlexGroup>
    </EuiPanel>
  );
};
