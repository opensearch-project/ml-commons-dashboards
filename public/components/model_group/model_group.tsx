/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EuiButton,
  EuiLoadingSpinner,
  EuiPageHeader,
  EuiSpacer,
  EuiTabbedContent,
  EuiTabbedContentTab,
  EuiText,
} from '@elastic/eui';
import React, { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useFetcher } from '../../hooks';
import { APIProvider } from '../../apis/api_provider';
import { ModelGroupOverviewCard } from './model_group_overview_card';
import { ModelGroupVersionsPanel } from './model_group_versions_panel';
import { ModelGroupDetailsPanel } from './model_group_details_panel';
import { ModelGroupTagsPanel } from './model_group_tags_panel';

export const ModelGroup = () => {
  const { id: modelId } = useParams<{ id: string }>();
  const { data, loading, error } = useFetcher(APIProvider.getAPI('model').getOne, modelId);
  const tabs = useMemo(
    () => [
      {
        name: 'Versions',
        id: 'versions',
        content: (
          <>
            <EuiSpacer size="m" />
            <ModelGroupVersionsPanel groupId={modelId} />
          </>
        ),
      },
      {
        name: 'Details',
        id: 'details',
        content: (
          <>
            <EuiSpacer size="m" />
            <ModelGroupDetailsPanel />
          </>
        ),
      },
      {
        name: 'Tags',
        id: 'tags',
        content: (
          <>
            <EuiSpacer size="m" />
            <ModelGroupTagsPanel />
          </>
        ),
      },
    ],
    [modelId]
  );
  const [selectedTab, setSelectedTab] = useState<EuiTabbedContentTab>(tabs[0]);

  if (loading) {
    // TODO: need to update per design
    return <EuiLoadingSpinner size="l" data-test-subj="model-group-loading-indicator" />;
  }

  if (error || !data) {
    // TODO: need to update per design
    return <>Error happened while loading the model</>;
  }

  return (
    <>
      <EuiPageHeader
        pageTitle={
          <EuiText size="s">
            <h1>{data.name}</h1>
          </EuiText>
        }
        rightSideItems={[
          <EuiButton fill>Register version</EuiButton>,
          <EuiButton color="danger">Delete</EuiButton>,
        ]}
      />
      <ModelGroupOverviewCard
        id={data.id}
        owner="TODO"
        isModelOwner={false}
        createdTime={data.created_time}
        updatedTime={data.last_updated_time}
        // TODO: Add description property here
      />
      <EuiSpacer size="l" />
      <EuiTabbedContent tabs={tabs} onTabClick={setSelectedTab} selectedTab={selectedTab} />
    </>
  );
};
