/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useContext, useCallback } from 'react';

import type { CoreStart, MountPoint, SavedObjectsStart } from '../../../../src/core/public';
import type {
  DataSourceManagementPluginSetup,
  DataSourceSelectableConfig,
} from '../../../../src/plugins/data_source_management/public';
import { DataSourceContext } from '../contexts/data_source_context';

export interface DataSourceTopNavMenuProps {
  notifications: CoreStart['notifications'];
  savedObjects: SavedObjectsStart;
  dataSourceManagement?: DataSourceManagementPluginSetup;
  setActionMenu: (menuMount: MountPoint | undefined) => void;
}

export const DataSourceTopNavMenu = ({
  savedObjects,
  notifications,
  setActionMenu,
  dataSourceManagement,
}: DataSourceTopNavMenuProps) => {
  const DataSourceMenu = useMemo(() => dataSourceManagement?.ui.getDataSourceMenu(), [
    dataSourceManagement,
  ]);
  const { selectedDataSourceOption, setSelectedDataSourceOption } = useContext(DataSourceContext);
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
