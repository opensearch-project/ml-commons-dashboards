/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import semver from 'semver';

import { DataSourceOption } from '../contexts';
import pluginManifest from '../../opensearch_dashboards.json';
import type { SavedObject } from '../../../../src/core/public';
import type { DataSourceAttributes } from '../../../../src/plugins/data_source/common/data_sources';

export const DATA_SOURCE_FETCHING_ID = Symbol('DATA_SOURCE_FETCHING_ID');
export const DATA_SOURCE_INVALID_ID = Symbol('DATA_SOURCE_INVALID_ID');

export const getDataSourceId = (
  dataSourceEnabled: boolean | null,
  selectedDataSourceOption: DataSourceOption | null | undefined
) => {
  if (!dataSourceEnabled) {
    return undefined;
  }
  if (selectedDataSourceOption === null) {
    return DATA_SOURCE_FETCHING_ID;
  }
  if (selectedDataSourceOption === undefined) {
    return DATA_SOURCE_INVALID_ID;
  }
  // If selected data source is local cluster, the data source id should be undefined
  if (selectedDataSourceOption.id === '') {
    return undefined;
  }
  return selectedDataSourceOption.id;
};

export type DataSourceId = ReturnType<typeof getDataSourceId>;

export const isDataSourceCompatible = (dataSource: SavedObject<DataSourceAttributes>) => {
  if (
    'requiredOSDataSourcePlugins' in pluginManifest &&
    !pluginManifest.requiredOSDataSourcePlugins.every((plugin) =>
      dataSource.attributes.installedPlugins?.includes(plugin)
    )
  ) {
    return false;
  }

  // filter out data sources which is NOT in the support range of plugin
  if (
    'supportedOSDataSourceVersions' in pluginManifest &&
    !semver.satisfies(
      dataSource.attributes.dataSourceVersion,
      pluginManifest.supportedOSDataSourceVersions,
      {
        includePrerelease: true,
      }
    )
  ) {
    return false;
  }
  return true;
};
