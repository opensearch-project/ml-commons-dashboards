/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiButton, EuiLoadingSpinner, EuiPageHeader, EuiPanel, EuiText } from '@elastic/eui';
import React from 'react';
import { useParams } from 'react-router-dom';
import { useFetcher } from '../../hooks';
import { APIProvider } from '../../apis/api_provider';

export const ModelGroup = () => {
  const { id: modelId } = useParams<{ id: string }>();
  const { data, loading, error } = useFetcher(APIProvider.getAPI('model').getOne, modelId);

  if (loading) {
    // TODO: need to update per design
    return <EuiLoadingSpinner size="l" />;
  }

  if (error) {
    // TODO: need to update per design
    return 'Error happened while loading the model';
  }

  return (
    <>
      <EuiPageHeader
        pageTitle={
          <EuiText size="s">
            <h1>{data?.name}</h1>
          </EuiText>
        }
        rightSideItems={[
          <EuiButton fill>Register version</EuiButton>,
          <EuiButton>Edit</EuiButton>,
          <EuiButton color="danger">Delete</EuiButton>,
        ]}
      />
      <EuiPanel>
        <EuiText size="s">
          <h2>Versions</h2>
        </EuiText>
      </EuiPanel>
    </>
  );
};
