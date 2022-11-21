import React from 'react';
import {
  EuiSpacer,
  EuiButton,
  EuiModal,
  EuiModalHeader,
  EuiModalHeaderTitle,
  EuiModalBody,
  EuiModalFooter,
  EuiRadio,
} from '@elastic/eui';

interface Props {
  onClose: () => void;
  onConfirm: () => void;
}

export const NodesModal = ({ onClose, onConfirm }: Props) => {
  return (
    <EuiModal onClose={onClose}>
      <EuiModalHeader>
        <EuiModalHeaderTitle>
          <h1>Select Nodes</h1>
        </EuiModalHeaderTitle>
      </EuiModalHeader>

      <EuiModalBody>
        <EuiRadio
          id="ml-nodes-radio"
          label="All nodes"
          checked={true}
          onChange={() => {}}
          compressed
        />
        <EuiSpacer />
      </EuiModalBody>

      <EuiModalFooter>
        <EuiButton onClick={onConfirm} fill>
          Confirm
        </EuiButton>
      </EuiModalFooter>
    </EuiModal>
  );
};
