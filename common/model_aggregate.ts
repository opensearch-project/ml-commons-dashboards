/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ModelAggregateItem {
  id: string;
  name: string;
  description?: string;
  latest_version: number;
  deployed_versions: string[];
  owner_name: string;
  created_time?: number;
  last_updated_time: number;
}

export type ModelAggregateSort =
  | 'name-asc'
  | 'name-desc'
  | 'latest_version-asc'
  | 'latest_version-desc'
  | 'description-asc'
  | 'description-desc'
  | 'owner_name-asc'
  | 'owner_name-desc'
  | 'last_updated_time-asc'
  | 'last_updated_time-desc';
