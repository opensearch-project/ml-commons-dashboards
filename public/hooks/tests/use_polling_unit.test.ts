/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { act, renderHook } from '@testing-library/react-hooks';

import { usePollingUntil } from '../use_polling_until';

describe('usePollingUntil', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should call onGiveUp after continueChecker return false', async () => {
    const onGiveUp = jest.fn(() => {});
    const continueChecker = () => Promise.resolve(false);
    const { result } = renderHook(() =>
      usePollingUntil({
        continueChecker,
        onGiveUp,
        onMaxRetries: () => {},
      })
    );
    expect(onGiveUp).not.toHaveBeenCalled();
    await act(async () => {
      result.current.start();
      jest.runOnlyPendingTimers();
    });
    expect(onGiveUp).toHaveBeenCalled();
  });

  it('should call onMaxRetries after call continueChecker 3 times', async () => {
    const onGiveUp = () => {};
    const onMaxRetries = jest.fn(() => {});
    const continueChecker = jest.fn(() => Promise.resolve(true));
    const { result } = renderHook(() =>
      usePollingUntil({
        maxRetries: 3,
        continueChecker,
        onGiveUp,
        onMaxRetries,
      })
    );
    expect(onMaxRetries).not.toHaveBeenCalled();
    await act(async () => {
      result.current.start();
      jest.runOnlyPendingTimers();
    });
    await act(async () => {
      jest.runOnlyPendingTimers();
    });
    await act(async () => {
      jest.runOnlyPendingTimers();
    });
    expect(continueChecker).toHaveBeenCalledTimes(3);
    expect(onMaxRetries).toHaveBeenCalled();
  });

  it('should not call continueChecker after unmount', async () => {
    const continueChecker = jest.fn(() => Promise.resolve(true));
    const { result, unmount } = renderHook(() =>
      usePollingUntil({
        continueChecker,
        onGiveUp: () => {},
        onMaxRetries: () => {},
      })
    );
    await act(async () => {
      result.current.start();
      jest.runOnlyPendingTimers();
    });
    expect(continueChecker).toHaveBeenCalledTimes(1);
    await act(async () => {
      unmount();
      jest.advanceTimersByTime(300);
    });
    expect(continueChecker).toHaveBeenCalledTimes(1);
  });

  it('should not call onGiveUp after unmount', async () => {
    let continueCheckerResolveFn: Function;
    const onGiveUp = jest.fn();
    const continueChecker = () =>
      new Promise<boolean>((resolve) => {
        continueCheckerResolveFn = () => {
          resolve(false);
        };
      });
    const { result, unmount } = renderHook(() =>
      usePollingUntil({
        continueChecker,
        onGiveUp,
        onMaxRetries: () => {},
      })
    );
    await act(async () => {
      result.current.start();
      jest.runOnlyPendingTimers();
    });
    await act(async () => {
      unmount();
    });
    await act(async () => {
      continueCheckerResolveFn();
    });
    expect(onGiveUp).not.toHaveBeenCalled();
  });
});
