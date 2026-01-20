/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { Monitoring } from '../public/components/monitoring';
import { routerPaths } from './router_paths';

interface RouteConfig {
  path: string;
  Component: React.ComponentType<any>;
  label: string;
  exact?: boolean;
  /**
   * true: display route in nav bar
   */
  nav: boolean;
}

export const ROUTES: RouteConfig[] = [
  {
    path: routerPaths.overview,
    Component: Monitoring,
    label: 'Overview',
    nav: true,
  },
];
