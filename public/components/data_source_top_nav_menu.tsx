/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useContext, useEffect, useCallback } from 'react';

import type { CoreStart, MountPoint, SavedObjectsStart } from '../../../../src/core/public';
import type {
  DataSourceManagementPluginSetup,
  DataSourceSelectableConfig,
} from '../../../../src/plugins/data_source_management/public';
import type { DataSourcePluginSetup } from '../../../../src/plugins/data_source/public';
import { DataSourceContext } from '../contexts/data_source_context';

export interface DataSourceTopNavMenuProps {
  notifications: CoreStart['notifications'];
  savedObjects: SavedObjectsStart;
  dataSource?: DataSourcePluginSetup;
  dataSourceManagement?: DataSourceManagementPluginSetup;
  setActionMenu: (menuMount: MountPoint | undefined) => void;
}

export const DataSourceTopNavMenu = ({
  dataSource,
  savedObjects,
  notifications,
  setActionMenu,
  dataSourceManagement,
}: DataSourceTopNavMenuProps) => {
  const dataSourceEnabled = !!dataSource?.dataSourceEnabled;
  const DataSourceMenu = useMemo(
    () => (dataSourceEnabled ? dataSourceManagement?.ui.getDataSourceMenu() : null),
    [dataSourceEnabled, dataSourceManagement]
  );
  const {
    selectedDataSourceOption,
    setSelectedDataSourceOption,
    setDataSourceEnabled,
  } = useContext(DataSourceContext);
  const activeOption = useMemo(() => (selectedDataSourceOption ? [selectedDataSourceOption] : []), [
    selectedDataSourceOption,
  ]);

  const handleDataSourcesSelected = useCallback<
    DataSourceSelectableConfig['onSelectedDataSources']
  >(
    (dataSourceOptions) => {
      setSelectedDataSourceOption(dataSourceOptions[0]);
    },
    [setSelectedDataSourceOption]
  );

  useEffect(() => {
    setDataSourceEnabled(dataSourceEnabled);
  }, [dataSourceEnabled, setDataSourceEnabled]);

  if (!DataSourceMenu) {
    return null;
  }
  return (
    <DataSourceMenu
      componentType="DataSourceSelectable"
      componentConfig={{
        notifications,
        savedObjects: savedObjects.client,
        onSelectedDataSources: handleDataSourcesSelected,
        activeOption,
      }}
      setMenuMountPoint={setActionMenu}
    />
  );
};
