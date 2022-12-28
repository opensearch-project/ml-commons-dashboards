/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { Monitoring } from '../public/components/model_list';

type RouteConfig = {
  path: string;
  Component: React.ComponentType<any>;
  label: string;
  exact?: boolean;
};

export const ROUTES: RouteConfig[] = [
  {
    path: '/',
    Component: Monitoring,
    label: 'Monitoring',
  },
];

/* export const ROUTES1 = [
  {
    path: routerPaths.train,
    Component: Train,
    label: 'Train Model',
    icon: 'createSingleMetricJob',
  },
  {
    path: routerPaths.modelList,
    Component: ModelList,
    label: 'Model List',
    icon: 'createSingleMetricJob',
  },
  {
    path: routerPaths.predict,
    Component: Predict,
    label: 'Predict',
    icon: 'regressionJob',
  },
  {
    path: '/',
    Component: Home,
    label: 'Home',
    exact: true,
  },
  {
    path: routerPaths.taskList,
    Component: TaskList,
    label: 'Task List',
    icon: 'createSingleMetricJob',
  },
  {
    path: routerPaths.modelDetail,
    Component: ModelDetail,
  },
  {
    path: routerPaths.modelUpload,
    label: 'Model Upload',
    Component: ModelUpload,
  },
  {
    path: routerPaths.registerModel,
    label: 'Register Model',
    Component: RegisterModelForm,
  },
];*/
