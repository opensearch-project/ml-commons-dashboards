/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback, useEffect, useRef } from 'react';

const delay = async (ms: number) =>
  await new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

export const usePollingUntil = ({
  pollingGap = 300,
  maxRetries = 100,
  continueChecker,
  onMaxRetries,
  onGiveUp,
}: {
  pollingGap?: number;
  maxRetries?: number;
  continueChecker: () => Promise<boolean>;
  onGiveUp: () => void;
  onMaxRetries: () => void;
}) => {
  const mountedRef = useRef(true);
  const continueCheckerRef = useRef(continueChecker);
  continueCheckerRef.current = continueChecker;
  const pollingTimes = useRef(0);
  const onMaxRetiresRef = useRef(onMaxRetries);
  onMaxRetiresRef.current = onMaxRetries;
  const onGiveUpRef = useRef(onGiveUp);
  onGiveUpRef.current = onGiveUp;

  const start = useCallback(async () => {
    if (pollingTimes.current >= maxRetries) {
      onMaxRetiresRef.current();
      return;
    }
    await delay(pollingGap);
    if (!mountedRef.current) {
      return;
    }
    pollingTimes.current += 1;
    const flag = await continueCheckerRef.current();
    if (!mountedRef.current) {
      return;
    }
    if (!flag) {
      onGiveUpRef.current();
      return;
    }
    start();
  }, [pollingGap, maxRetries]);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return {
    start,
  };
};
