/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import type { SecurityPluginStart } from '../../../security-dashboards-plugin/public/types';

let securityDashboardsStore: SecurityPluginStart | undefined;

/**
 * Holds the optional security-dashboards-plugin start contract for modules
 * outside the React tree (mirrors InnerHttpProvider). `undefined` when the
 * plugin isn't installed, in which case its client-side DOM-marker SPI can
 * never mount a Share button — callers should treat that as
 * resource-sharing-unavailable and fail closed.
 */
export class SecurityDashboardsProvider {
  public static setSecurityDashboards(securityDashboards: SecurityPluginStart | undefined) {
    securityDashboardsStore = securityDashboards;
  }

  public static getSecurityDashboards() {
    return securityDashboardsStore;
  }
}
