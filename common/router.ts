/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { ModelList } from '../public/components/model_list';
import { Monitoring } from '../public/components/monitoring';
import { RegisterModelForm } from '../public/components/register_model/register_model';
import { routerPaths } from './router_paths';

interface RouteConfig {
  path: string;
  Component: React.ComponentType<any>;
  label: string;
  exact?: boolean;
}

export const ROUTES: RouteConfig[] = [
  {
    path: routerPaths.monitoring,
    Component: Monitoring,
    label: 'Monitoring',
  },
  {
    path: routerPaths.registerModel,
    label: 'Register Model',
    Component: RegisterModelForm,
  },
  {
    path: routerPaths.modelList,
    label: 'Model List',
    Component: ModelList,
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
