/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  EuiButton,
  EuiPageHeader,
  EuiFlexGroup,
  EuiFlexItem,
  EuiLoadingSpinner,
  EuiSpacer,
  EuiPanel,
  EuiLoadingContent,
  EuiTabbedContent,
  EuiButtonIcon,
} from '@elastic/eui';
import { generatePath, useHistory, useParams } from 'react-router-dom';
import { FormProvider, useForm } from 'react-hook-form';

import { routerPaths } from '../../../common';
import { useFetcher } from '../../hooks';
import { APIProvider } from '../../apis/api_provider';

import { VersionToggler } from './version_toggler';
import { ModelVersionCallout } from './version_callout';
import { ModelVersionDetails } from './version_details';
import { ModelVersionInformation } from './version_information';
import { ModelVersionArtifact } from './version_artifact';
import { ModelVersionTags } from './version_tags';
import { ModelVersionFormData } from './types';
import { ModelGroupSearchItem } from '../../apis/model_group';
import { ToggleDeployButton } from './toggle_deploy_button';

export const ModelVersion = () => {
  const [modelData, setModelData] = useState<ModelGroupSearchItem>();
  const { id: modelVersionId } = useParams<{ id: string }>();
  const { data: modelVersionData, loading: modelVersionLoading, reload } = useFetcher(
    APIProvider.getAPI('modelVersion').getOne,
    modelVersionId
  );
  const [modelInfo, setModelInfo] = useState<{ version: string; name: string }>();
  const history = useHistory();
  const modelName = modelVersionData?.name;
  const modelVersion = modelVersionData?.model_version;
  const form = useForm<ModelVersionFormData>();

  const onVersionChange = useCallback(
    ({ newVersion, newId }: { newVersion: string; newId: string }) => {
      setModelInfo((prevModelInfo) =>
        prevModelInfo ? { ...prevModelInfo, version: newVersion } : prevModelInfo
      );
      history.push(generatePath(routerPaths.modelVersion, { id: newId }));
    },
    [history]
  );

  useEffect(() => {
    if (modelVersionData?.model_group_id) {
      APIProvider.getAPI('model')
        .getOne(modelVersionData?.model_group_id)
        .then((res) => {
          setModelData(res);
        });
    }
  }, [modelVersionData?.model_group_id]);

  useEffect(() => {
    if (!modelName || !modelVersion) {
      return;
    }
    setModelInfo((prevModelInfo) => {
      if (prevModelInfo?.name === modelName && prevModelInfo?.version === modelVersion) {
        return prevModelInfo;
      }
      return {
        name: modelName,
        version: modelVersion,
      };
    });
  }, [modelName, modelVersion]);

  useEffect(() => {
    if (modelVersionData) {
      form.reset({
        versionNotes: 'TODO', // TODO: read from model.versionNotes
        tags: [
          { key: 'Accuracy', value: '0.85', type: 'number' as const },
          { key: 'Precision', value: '0.64', type: 'number' as const },
          { key: 'Task', value: 'Image classification', type: 'string' as const },
        ], // TODO: read from model.tags
        configuration: JSON.stringify(modelVersionData.model_config, undefined, 2),
        modelFileFormat: modelVersionData.model_format,
        // TODO: read model url or model filename
        artifactSource: 'source_not_changed',
        // modelFile: new File([], 'artifact.zip'),
        modelURL: 'http://url.to/artifact.zip',
      });
    }
  }, [modelVersionData, form]);

  const tabs = [
    {
      id: 'version-information',
      name: 'Version information',
      content: modelVersionLoading ? (
        <>
          <EuiSpacer size="m" />
          <EuiPanel style={{ minHeight: 200 }}>
            <EuiLoadingContent data-test-subj="ml-versionDetailsLoading" lines={2} />
          </EuiPanel>
        </>
      ) : (
        <>
          <EuiSpacer size="m" />
          <ModelVersionInformation />
          <EuiSpacer size="m" />
          <ModelVersionTags />
        </>
      ),
    },
    {
      id: 'artifact-configuration',
      name: 'Artifact and configuration',
      content: modelVersionLoading ? (
        <>
          <EuiSpacer size="m" />
          <EuiPanel style={{ minHeight: 200 }}>
            <EuiLoadingContent data-test-subj="ml-versionDetailsLoading" lines={2} />
          </EuiPanel>
        </>
      ) : (
        <>
          <EuiSpacer size="m" />
          <ModelVersionArtifact />
        </>
      ),
    },
  ];

  return (
    <FormProvider {...form}>
      {!modelInfo ? (
        <>
          <EuiLoadingSpinner data-test-subj="modelVersionLoadingSpinner" />
          <EuiSpacer size="m" />
        </>
      ) : (
        <EuiPageHeader
          pageTitle={
            <EuiFlexGroup gutterSize="m" responsive={false} alignItems="center">
              <EuiFlexItem grow={false}>{modelInfo.name}</EuiFlexItem>
              <EuiFlexItem grow={false}>
                <VersionToggler
                  modelName={modelInfo.name}
                  currentVersion={modelInfo.version}
                  onVersionChange={onVersionChange}
                />
              </EuiFlexItem>
            </EuiFlexGroup>
          }
          rightSideGroupProps={{
            gutterSize: 'm',
            alignItems: 'center',
          }}
          rightSideItems={[
            <EuiButton fill>Register version</EuiButton>,
            modelVersionData && (
              <ToggleDeployButton
                onComplete={reload}
                onError={reload}
                modelName={modelVersionData.name}
                modelVersion={modelVersionData.model_version}
                modelState={modelVersionData.model_state}
                modelVersionId={modelVersionId}
              />
            ),
            <EuiButtonIcon iconType="trash" color="danger">
              Delete
            </EuiButtonIcon>,
          ]}
        />
      )}
      {modelVersionData && (
        <ModelVersionCallout
          modelVersionId={modelVersionId}
          modelState={modelVersionData.model_state}
        />
      )}
      <EuiSpacer size="m" />
      {modelVersionLoading ? (
        <EuiPanel style={{ minHeight: 200 }}>
          <EuiLoadingContent data-test-subj="ml-versionDetailsLoading" lines={2} />
        </EuiPanel>
      ) : (
        <ModelVersionDetails
          description={modelData?.description}
          modelVersionId={modelVersionData?.id}
          createdTime={modelVersionData?.created_time}
          lastUpdatedTime={modelVersionData?.last_updated_time}
          owner={modelData?.owner.name}
        />
      )}
      <EuiSpacer size="m" />
      <EuiTabbedContent tabs={tabs} />
    </FormProvider>
  );
};
