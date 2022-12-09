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
  EuiLink,
  EuiSpacer,
  EuiFlexGroup,
  EuiFlexItem,
  EuiButton,
  EuiDescriptionList,
} from '@elastic/eui';
import { APIProvider } from '../../apis/api_provider';
import { useFetcher } from '../../hooks/use_fetcher';
import { Link, generatePath, useHistory } from 'react-router-dom';
import { routerPaths } from '../../../common/router_paths';
import { VersionTable } from './version_table';

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
  const history = useHistory();
  const latestVersion = useMemo(() => {
    //TODO: currently assume that api will return versions in order
    if (model?.data) {
      const data = model.data;
      return data[data.length - 1];
    }
    return { id: '' };
  }, [model]);

  const handleTableChange = useCallback((criteria) => {
    const { sort } = criteria;
    setSort(sort);
  }, []);

  return (
    <EuiFlyout onClose={onClose}>
      <EuiFlyoutHeader hasBorder>
        <EuiTitle>
          <h2>{name}</h2>
        </EuiTitle>
        {latestVersion.id
          ? [
              <EuiSpacer size="l" />,
              <Link to={generatePath(routerPaths.modelDetail, { id: latestVersion.id })}>
                <EuiLink>View Full Details</EuiLink>
              </Link>,
            ]
          : []}
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
          <EuiButton
            fill
            onClick={() => {
              history.push(`${routerPaths.modelUpload}?name=${name}`);
            }}
          >
            Register new version
          </EuiButton>
        </EuiFlexGroup>
        <VersionTable models={model?.data ?? []} sort={sort} onChange={handleTableChange} />
      </EuiFlyoutBody>
    </EuiFlyout>
  );
};
