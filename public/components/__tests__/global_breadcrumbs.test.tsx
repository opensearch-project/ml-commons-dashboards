/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { GlobalBreadcrumbs } from '../global_breadcrumbs';
import { history, render, waitFor, act } from '../../../test/test_utils';
import { ModelVersion, ModelVersionDetail } from '../../apis/model_version';

describe('<GlobalBreadcrumbs />', () => {
  it('should call onBreadcrumbsChange with overview title', () => {
    const onBreadcrumbsChange = jest.fn();
    render(<GlobalBreadcrumbs onBreadcrumbsChange={onBreadcrumbsChange} basename="/foo" />, {
      route: '/overview',
    });

    expect(onBreadcrumbsChange).toHaveBeenCalledWith([
      { text: 'Machine Learning', href: '/foo' },
      { text: 'Overview' },
    ]);
  });

  it('should call onBreadcrumbsChange with register model breadcrumbs', () => {
    const onBreadcrumbsChange = jest.fn();
    render(<GlobalBreadcrumbs onBreadcrumbsChange={onBreadcrumbsChange} basename="/" />, {
      route: '/model-registry/register-model',
    });

    expect(onBreadcrumbsChange).toHaveBeenCalledWith([
      { text: 'Machine Learning', href: '/' },
      { text: 'Model Registry', href: '/model-registry/model-list' },
      { text: 'Register model' },
    ]);
  });

  it('should call onBreadcrumbsChange with register version breadcrumbs', async () => {
    const onBreadcrumbsChange = jest.fn();
    render(<GlobalBreadcrumbs onBreadcrumbsChange={onBreadcrumbsChange} basename="/" />, {
      route: '/model-registry/register-model/model-id-1',
    });

    expect(onBreadcrumbsChange).toHaveBeenCalledWith([
      { text: 'Machine Learning', href: '/' },
      { text: 'Model Registry', href: '/model-registry/model-list' },
    ]);

    await waitFor(() => {
      expect(onBreadcrumbsChange).toBeCalledTimes(2);
      expect(onBreadcrumbsChange).toHaveBeenLastCalledWith([
        { text: 'Machine Learning', href: '/' },
        { text: 'Model Registry', href: '/model-registry/model-list' },
        { text: 'model1', href: '/model-registry/model/model-id-1' },
        { text: 'Register version' },
      ]);
    });
  });

  it('should call onBreadcrumbsChange with model breadcrumbs', async () => {
    const onBreadcrumbsChange = jest.fn();
    render(<GlobalBreadcrumbs onBreadcrumbsChange={onBreadcrumbsChange} basename="/" />, {
      route: '/model-registry/model/model-id-1',
    });

    expect(onBreadcrumbsChange).toHaveBeenCalledWith([
      { text: 'Machine Learning', href: '/' },
      { text: 'Model Registry', href: '/model-registry/model-list' },
    ]);

    await waitFor(() => {
      expect(onBreadcrumbsChange).toBeCalledTimes(2);
      expect(onBreadcrumbsChange).toHaveBeenLastCalledWith([
        { text: 'Machine Learning', href: '/' },
        { text: 'Model Registry', href: '/model-registry/model-list' },
        { text: 'model1' },
      ]);
    });
  });

  it('should call onBreadcrumbsChange with model version breadcrumbs', async () => {
    const onBreadcrumbsChange = jest.fn();
    render(<GlobalBreadcrumbs onBreadcrumbsChange={onBreadcrumbsChange} basename="/" />, {
      route: '/model-registry/model-version/1',
    });

    expect(onBreadcrumbsChange).toHaveBeenCalledWith([
      { text: 'Machine Learning', href: '/' },
      { text: 'Model Registry', href: '/model-registry/model-list' },
    ]);

    await waitFor(() => {
      expect(onBreadcrumbsChange).toBeCalledTimes(2);
      expect(onBreadcrumbsChange).toHaveBeenLastCalledWith([
        { text: 'Machine Learning', href: '/' },
        { text: 'Model Registry', href: '/model-registry/model-list' },
        { text: 'model1', href: '/model-registry/model/1' },
        { text: 'Version 1.0.0' },
      ]);
    });
  });

  it('should NOT call onBreadcrumbs with steal breadcrumbs after pathname changed', async () => {
    jest.useFakeTimers();
    const onBreadcrumbsChange = jest.fn();
    const modelGetOneMock = jest.spyOn(ModelVersion.prototype, 'getOne').mockImplementation(
      (id) =>
        new Promise((resolve) => {
          setTimeout(
            () => {
              resolve({
                id,
                name: `model${id}`,
                model_version: `1.0.${id}`,
              } as ModelVersionDetail);
            },
            id === '2' ? 1000 : 0
          );
        })
    );
    render(<GlobalBreadcrumbs onBreadcrumbsChange={onBreadcrumbsChange} basename="/" />, {
      route: '/model-registry/model-version/2',
    });

    expect(onBreadcrumbsChange).toHaveBeenLastCalledWith([
      { text: 'Machine Learning', href: '/' },
      { text: 'Model Registry', href: '/model-registry/model-list' },
    ]);

    history.current.push('/model-registry/model/model-id-1');

    await act(async () => {
      jest.advanceTimersByTime(200);
    });

    expect(onBreadcrumbsChange).toHaveBeenLastCalledWith([
      { text: 'Machine Learning', href: '/' },
      { text: 'Model Registry', href: '/model-registry/model-list' },
      { text: 'model1' },
    ]);

    await act(async () => {
      jest.advanceTimersByTime(1000);
    });

    expect(onBreadcrumbsChange).not.toHaveBeenLastCalledWith([
      { text: 'Machine Learning', href: '/' },
      { text: 'Model Registry', href: '/model-registry/model-list' },
      { text: 'model2', href: '/model-registry/model/2' },
      { text: 'Version 1.0.2' },
    ]);

    modelGetOneMock.mockRestore();
    jest.useRealTimers();
  });
});
