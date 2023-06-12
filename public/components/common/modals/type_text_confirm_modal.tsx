/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback } from 'react';
import {
  EuiConfirmModal,
  EuiConfirmModalProps,
  EuiFieldText,
  EuiSpacer,
  EuiText,
} from '@elastic/eui';
import { EuiFieldTextProps } from '@opensearch-project/oui';

export interface TypeTextConfirmModalProps extends EuiConfirmModalProps {
  textToType: string;
}

export const TypeTextConfirmModal = ({
  textToType,
  children,
  ...restProps
}: TypeTextConfirmModalProps) => {
  const [typedText, setTypedText] = useState<string>();
  const handleTextChange = useCallback<Required<EuiFieldTextProps>['onChange']>((e) => {
    setTypedText(e.target.value);
  }, []);

  return (
    <EuiConfirmModal
      {...restProps}
      confirmButtonDisabled={typedText !== textToType || restProps.confirmButtonDisabled}
    >
      {children}
      <EuiText aria-label={`Type ${textToType} to confirm.`}>
        Type <b>{textToType}</b> to confirm.
      </EuiText>
      <EuiSpacer size="s" />
      <EuiFieldText aria-label="confirm text input" fullWidth onChange={handleTextChange} />
    </EuiConfirmModal>
  );
};
