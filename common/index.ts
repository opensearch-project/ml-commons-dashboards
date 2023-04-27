/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

export const PLUGIN_ID = 'ml-commons-dashboards';
export const PLUGIN_NAME = 'Machine Learning';
export const PLUGIN_DESC = `ML Commons for OpenSearch eases the development of machine learning features by providing a set of common machine learning (ML) algorithms through transport and REST API calls. Those calls choose the right nodes and resources for each ML request and monitors ML tasks to ensure uptime. This allows you to leverage existing open-source ML algorithms and reduce the effort required to develop new ML features.`;

export * from './constant';
export * from './status';
export * from './model';
export * from './router_paths';
