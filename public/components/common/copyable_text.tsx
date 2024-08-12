/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useState, useRef } from 'react';
import { EuiSmallButtonIcon, copyToClipboard, EuiToolTip } from '@elastic/eui';

interface Props {
  text: string;
  iconLeft: boolean; // whether icon is in the left of text
  tooltipText: string;
  copiedTooltipText?: string;
}
export const CopyableText = ({
  text,
  iconLeft,
  tooltipText,
  copiedTooltipText = 'Copied',
}: Props) => {
  const [isTextCopied, setTextCopied] = useState(false);
  const copyButtonRef = useRef<HTMLAnchorElement>(null);

  const onClick = useCallback(() => {
    copyButtonRef?.current?.focus(); // sets focus for safari
    copyToClipboard(text);
    setTextCopied(true);
  }, [text, setTextCopied]);
  const onMouseLeave = useCallback(() => {
    setTextCopied(false);
  }, [setTextCopied]);
  return (
    <div data-test-subj="copyable-text-div">
      {iconLeft ? null : text}
      <EuiToolTip content={isTextCopied ? copiedTooltipText : tooltipText}>
        <EuiSmallButtonIcon
          buttonRef={copyButtonRef}
          aria-label="Copy ID to clipboard"
          color="text"
          data-test-subj="copy-id-button"
          iconType="copy"
          onClick={onClick}
          onMouseLeave={onMouseLeave}
        />
      </EuiToolTip>
      {iconLeft ? text : null}
    </div>
  );
};
