/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { Monitoring } from '../public/components/monitoring';

interface RouteConfig {
  path: string;
  Component: React.ComponentType<any>;
  label: string;
  exact?: boolean;
}

export const ROUTES: RouteConfig[] = [
  {
    path: '/',
    Component: Monitoring,
    label: 'Monitoring',
  },
];

/* export const ROUTES1 = [
  {
    path: routerPaths.modelList,
    Component: ModelList,
    label: 'Model List',
    icon: 'createSingleMetricJob',
  },
  {
    path: routerPaths.registerModel,
    label: 'Register Model',
    Component: RegisterModelForm,
  },
];*/
