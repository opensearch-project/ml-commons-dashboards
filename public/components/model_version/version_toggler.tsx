/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  EuiIcon,
  EuiText,
  EuiFlexGroup,
  EuiFlexItem,
  EuiPopover,
  EuiSelectable,
  EuiSelectableOption,
} from '@elastic/eui';

import { useFetcher } from '../../hooks';
import { APIProvider } from '../../apis/api_provider';

interface VersionTogglerProps {
  modelName: string;
  currentVersion: string;
  onVersionChange: (version: { newVersion: string; newId: string }) => void;
}

export const VersionToggler = ({
  modelName,
  currentVersion,
  onVersionChange,
}: VersionTogglerProps) => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const { data: versions } = useFetcher(APIProvider.getAPI('modelVersion').search, {
    name: modelName,
    from: 0,
    // TODO: Implement scroll bottom load more once version toggler UX confirmed
    size: 50,
  });

  const options = useMemo(() => {
    return versions?.data.map(({ model_version: modelVersion, id }) => ({
      label: modelVersion,
      checked: modelVersion === currentVersion ? ('on' as const) : undefined,
      key: id,
    }));
  }, [versions, currentVersion]);

  const openPopover = useCallback(() => {
    setIsPopoverOpen((isOpen) => !isOpen);
  }, []);

  const closePopover = useCallback(() => {
    setIsPopoverOpen(false);
  }, []);

  const onVersionSelectableChange = useCallback(
    (newOptions: Array<EuiSelectableOption<{}>>) => {
      const checkedOption = newOptions.find(({ checked }) => checked === 'on');
      if (!checkedOption || !checkedOption.key || !checkedOption.label) {
        return;
      }
      onVersionChange({ newVersion: checkedOption.label, newId: checkedOption.key });
    },
    [onVersionChange]
  );

  return (
    <EuiPopover
      isOpen={isPopoverOpen}
      button={
        <EuiFlexGroup onClick={openPopover} alignItems="center" gutterSize="xs" responsive={false}>
          <EuiFlexItem grow={false}>
            <EuiText>v{currentVersion}</EuiText>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiIcon type="arrowDown" />
          </EuiFlexItem>
        </EuiFlexGroup>
      }
      closePopover={closePopover}
    >
      <EuiSelectable
        aria-label="Version Selectable"
        listProps={{ bordered: true }}
        options={options}
        singleSelection={true}
        onChange={onVersionSelectableChange}
      >
        {(list) => <div style={{ width: 240 }}>{list}</div>}
      </EuiSelectable>
    </EuiPopover>
  );
};
