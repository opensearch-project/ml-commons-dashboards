/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { Model } from '../public/components/model';
import { ModelList } from '../public/components/model_list';
import { Monitoring } from '../public/components/monitoring';
import { RegisterModelForm } from '../public/components/register_model/register_model';
import { ModelVersion } from '../public/components/model_version';
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
  {
    path: routerPaths.registerModel,
    label: 'Register Model',
    Component: RegisterModelForm,
    nav: false,
  },
  {
    path: routerPaths.modelList,
    label: 'Model Registry',
    Component: ModelList,
    nav: true,
  },
  {
    path: routerPaths.model,
    // TODO: refactor label to be dynamic so that we can display group name in breadcrumb
    label: 'Model',
    Component: Model,
    nav: false,
  },
  {
    path: routerPaths.modelVersion,
    label: 'Model Version',
    Component: ModelVersion,
    nav: false,
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
