/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useCallback, useState } from 'react';
import {
  EuiFlyout,
  EuiFlyoutBody,
  EuiFlyoutHeader,
  EuiTitle,
  EuiSpacer,
  EuiFlexGroup,
  EuiFlexItem,
  EuiDescriptionList,
} from '@elastic/eui';
import { APIProvider } from '../../apis/api_provider';
import { useFetcher } from '../../hooks/use_fetcher';
import { routerPaths } from '../../../common/router_paths';
import { VersionTable } from './version_table';
import { EuiLinkButton } from '../common';
import { generatePath } from 'react-router-dom';

export type VersionTableSort = 'version-desc' | 'version-asc';

interface Props {
  onClose: () => void;
  name: string;
}

export const ModelDrawer = ({ onClose, name }: Props) => {
  const [sort, setSort] = useState<VersionTableSort>('version-desc');
  const { data: model } = useFetcher(APIProvider.getAPI('model').search, {
    name,
    currentPage: 1,
    pageSize: 50,
    sort: [sort],
  });
  const latestVersion = useMemo(() => {
    // TODO: currently assume that api will return versions in order
    if (model?.data) {
      const data = model.data;
      return data[0];
    }
    return { id: '' };
  }, [model]);

  const handleTableChange = useCallback((criteria) => {
    setSort(criteria.sort);
  }, []);

  return (
    <EuiFlyout onClose={onClose}>
      <EuiFlyoutHeader hasBorder>
        <EuiTitle>
          <h2>{name}</h2>
        </EuiTitle>
        {latestVersion.id ? (
          <>
            <EuiSpacer size="l" />
            {/* TODO: update after exsiting detail page */}
            {/* <EuiCustomLink to={generatePath(routerPaths.modelDetail, { id: latestVersion.id })}>
              <EuiLink>View Full Details</EuiLink>
            </EuiCustomLink> */}
          </>
        ) : null}
      </EuiFlyoutHeader>
      <EuiFlyoutBody>
        {model && <EuiDescriptionList type="row" listItems={[]} />}
        <EuiFlexGroup alignItems="center">
          <EuiFlexItem grow={false}>
            <EuiTitle size="s">
              <h3>Versions</h3>
            </EuiTitle>
          </EuiFlexItem>
          <EuiFlexItem />
          {latestVersion?.id && (
            <EuiLinkButton
              fill
              to={generatePath(routerPaths.registerModel, { id: latestVersion.id })}
            >
              Register new version
            </EuiLinkButton>
          )}
        </EuiFlexGroup>
        <VersionTable models={model?.data ?? []} sort={sort} onChange={handleTableChange} />
      </EuiFlyoutBody>
    </EuiFlyout>
  );
};
