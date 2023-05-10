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
} from '@elastic/eui';
import { generatePath, useHistory, useParams } from 'react-router-dom';

import { useFetcher } from '../../hooks';
import { APIProvider } from '../../apis/api_provider';
import { routerPaths } from '../../../common/router_paths';
import { VersionToggler } from './version_toggler';
import { ModelVersionCallout } from './model_version_callout';
import { MODEL_STATE } from '../../../common/model';
import { ModelVersionDetails } from './model_version_details';

export const ModelVersion = () => {
  const { id: modelId } = useParams<{ id: string }>();
  const { data: model } = useFetcher(APIProvider.getAPI('model').getOne, modelId);
  const [modelInfo, setModelInfo] = useState<{ version: string; name: string }>();
  const history = useHistory();
  const modelName = model?.name;
  const modelVersion = model?.model_version;

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

  if (!modelInfo) {
    return <EuiLoadingSpinner data-test-subj="modelVersionLoadingSpinner" />;
  }
  return (
    <>
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
        }}
        rightSideItems={[
          <EuiButton fill>Register version</EuiButton>,
          <EuiButton>Deploy</EuiButton>,
          <EuiButton color="danger">Delete</EuiButton>,
        ]}
      />
      <ModelVersionCallout modelVersionId="" modelState={MODEL_STATE.loading} />
      <ModelVersionCallout modelVersionId="" modelState={MODEL_STATE.loadFailed} />
      <EuiSpacer size="m" />
      <ModelVersionDetails
        description={model?.description}
        modelId={model?.id}
        createdTime={model?.created_time}
        lastUpdatedTime={model?.last_updated_time}
      />
    </>
  );
};
