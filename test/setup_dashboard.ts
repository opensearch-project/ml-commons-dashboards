/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { InjectedMetadataService } from '../../../src/core/public/injected_metadata';
import { HttpService } from '../../../src/core/public/http';
import { FatalErrorsService } from '../../../src/core/public/fatal_errors';
import { I18nService } from '../../../src/core/public/i18n';
import { InnerHttpProvider } from '../public/apis/inner_http_provider';

export function setupDashboard() {
  const injectedMetadataService = new InjectedMetadataService({
    injectedMetadata: {
      version: 'x.x',
      buildNumber: 0,
      branch: 'x',
      basePath: '',
      serverBasePath: '',
      csp: { warnLegacyBrowsers: false },
      vars: {},
      env: {
        mode: { name: 'development', dev: true, prod: false },
        packageInfo: {
          version: 'x.x',
          branch: '',
          buildNum: 0,
          buildSha: '',
          dist: false,
        },
      },
      uiPlugins: [],
      anonymousStatusPage: false,
      legacyMetadata: { uiSettings: { defaults: {} } },
      branding: {},
    },
  });

  const fatalErrorsService = new FatalErrorsService(document.body, () => {});
  const injectedMetadata = injectedMetadataService.setup();
  const i18n = new I18nService().getContext();

  const http = new HttpService().setup({
    injectedMetadata,
    fatalErrors: fatalErrorsService.setup({ injectedMetadata, i18n }),
  });

  InnerHttpProvider.setHttp(http);
}
