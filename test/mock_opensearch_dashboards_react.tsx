/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { EuiToast } from '@elastic/eui';

import * as PluginContext from '../../../src/plugins/opensearch_dashboards_react/public';
import { MountWrapper } from '../../../src/core/public/utils';
import { MountPoint } from '../../../src/core/public';
import { OverlayModalOpenOptions } from '../../../src/core/public/overlays';

import { render } from './test_utils';

// Cannot spyOn(PluginContext, 'useOpenSearchDashboards') directly as it results in error:
// TypeError: Cannot redefine property: useOpenSearchDashboards
// So we have to mock the entire module first as a workaround
jest.mock('../../../src/plugins/opensearch_dashboards_react/public', () => {
  return {
    __esModule: true,
    ...jest.requireActual('../../../src/plugins/opensearch_dashboards_react/public'),
  };
});

const generateToastMock = () =>
  jest.fn((toastInput) => {
    render(
      <EuiToast
        title={
          typeof toastInput === 'string' ? (
            toastInput
          ) : typeof toastInput.title === 'string' || !toastInput.title ? (
            toastInput.title
          ) : (
            <MountWrapper mount={toastInput.title} />
          )
        }
      >
        {typeof toastInput !== 'string' &&
          (typeof toastInput.text !== 'string' && toastInput.text ? (
            <MountWrapper mount={toastInput.text} />
          ) : (
            toastInput.text
          ))}
      </EuiToast>
    );
    return {
      id: '',
    };
  });

export const mockUseOpenSearchDashboards = () =>
  jest.spyOn(PluginContext, 'useOpenSearchDashboards').mockReturnValue({
    services: {
      notifications: {
        toasts: {
          addDanger: generateToastMock(),
          addSuccess: generateToastMock(),
        },
      },
      overlays: {
        openModal: jest.fn((modelMountPoint: MountPoint, options?: OverlayModalOpenOptions) => {
          const { unmount } = render(<MountWrapper mount={modelMountPoint} />);
          return {
            onClose: Promise.resolve(),
            close: async () => {
              unmount();
            },
          };
        }),
      },
    },
  });
