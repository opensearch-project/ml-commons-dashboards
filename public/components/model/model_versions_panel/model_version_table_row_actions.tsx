/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback } from 'react';
import {
  EuiPopover,
  EuiButtonIcon,
  EuiContextMenuPanel,
  EuiContextMenuItem,
  copyToClipboard,
} from '@elastic/eui';

import { MODEL_STATE } from '../../../../common';

export const ModelVersionTableRowActions = ({ state, id }: { state: MODEL_STATE; id: string }) => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const handleShowActionsClick = useCallback(() => {
    setIsPopoverOpen((flag) => !flag);
  }, []);

  const closePopover = useCallback(() => {
    setIsPopoverOpen(false);
  }, []);

  return (
    <EuiPopover
      isOpen={isPopoverOpen}
      panelPaddingSize="none"
      anchorPosition="downCenter"
      button={
        <EuiButtonIcon
          aria-label="show actions"
          iconType="boxesHorizontal"
          color="text"
          onClick={handleShowActionsClick}
        />
      }
      closePopover={closePopover}
      ownFocus={false}
    >
      <div style={{ width: 192 }}>
        <EuiContextMenuPanel
          onClick={closePopover}
          items={[
            <EuiContextMenuItem
              key="copy-id"
              icon="copy"
              onClick={() => {
                copyToClipboard(id);
              }}
              style={{ padding: 8 }}
            >
              Copy ID
            </EuiContextMenuItem>,
            ...(state === MODEL_STATE.registerFailed
              ? [
                  <EuiContextMenuItem
                    key="upload-new-artifact"
                    icon="exportAction"
                    style={{ padding: 8 }}
                  >
                    Upload new artifact
                  </EuiContextMenuItem>,
                ]
              : []),
            ...(state === MODEL_STATE.uploaded || state === MODEL_STATE.unloaded
              ? [
                  <EuiContextMenuItem key="deploy" icon="exportAction" style={{ padding: 8 }}>
                    Deploy
                  </EuiContextMenuItem>,
                ]
              : []),
            ...(state === MODEL_STATE.loaded || state === MODEL_STATE.partiallyLoaded
              ? [
                  <EuiContextMenuItem key="undeploy" icon="importAction" style={{ padding: 8 }}>
                    Undeploy
                  </EuiContextMenuItem>,
                ]
              : []),
            <EuiContextMenuItem
              key="delete"
              icon="trash"
              color="danger"
              style={{ padding: 8, color: '#BD271E' }}
            >
              Delete
            </EuiContextMenuItem>,
          ]}
        />
      </div>
    </EuiPopover>
  );
};
