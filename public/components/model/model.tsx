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
import React, { useState, useMemo, useCallback } from 'react';
import { Link, generatePath, useParams } from 'react-router-dom';

import { routerPaths } from '../../../common';
import { useFetcher } from '../../hooks';
import { APIProvider } from '../../apis/api_provider';

import { ModelOverviewCard } from './model_overview_card';
import { ModelVersionsPanel } from './model_versions_panel';
import { ModelDetailsPanel } from './model_details_panel';
import { ModelTagsPanel } from './model_tags_panel';

export const Model = () => {
  const { id: modelId } = useParams<{ id: string }>();
  const { data, loading, error } = useFetcher(APIProvider.getAPI('modelGroup').getOne, modelId);
  const tabs = useMemo(
    () => [
      {
        name: 'Versions',
        id: 'versions',
        content: (
          <>
            <EuiSpacer size="m" />
            <ModelVersionsPanel modelId={modelId} />
          </>
        ),
      },
      {
        name: 'Details',
        id: 'details',
        // TODO: Add description property here
        content: (
          <>
            <EuiSpacer size="m" />
            <ModelDetailsPanel name={data?.name} id={modelId} />
          </>
        ),
      },
      {
        name: 'Tags',
        id: 'tags',
        // TODO: Change tagKeys property from backend and update tagKeys after change
        content: (
          <>
            <EuiSpacer size="m" />
            <ModelTagsPanel tagKeys={[{ name: 'F1', type: 'number' }]} onTagKeysChange={() => {}} />
          </>
        ),
      },
    ],
    [modelId, data]
  );
  const [selectedTabId, setSelectedTabId] = useState(tabs[0].id);

  const handleTabClick = useCallback((tab: EuiTabbedContentTab) => {
    setSelectedTabId(tab.id);
  }, []);

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
          <Link to={generatePath(routerPaths.registerModel, { id: modelId })}>
            <EuiButton fill>Register version</EuiButton>
          </Link>,
          <EuiButton color="danger">Delete</EuiButton>,
        ]}
      />
      <ModelOverviewCard
        id={data.id}
        owner={data.owner.name}
        isModelOwner={false}
        createdTime={data.created_time}
        updatedTime={data.last_updated_time}
        description={data.description}
      />
      <EuiSpacer size="l" />
      <EuiTabbedContent
        tabs={tabs}
        onTabClick={handleTabClick}
        selectedTab={tabs.find((tab) => tab.id === selectedTabId)}
      />
    </>
  );
};
