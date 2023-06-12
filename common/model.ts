/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

export interface OpenSearchModel {
  id: string;
  owner?: {
    backend_roles: string[];
    roles: string[];
    name: string;
  };
  latest_version: number;
  created_time: number;
  last_updated_time: number;
  name: string;
  description?: string;
  access: 'public' | 'restricted' | 'private';
}

export type ModelSort =
  | 'name-asc'
  | 'name-desc'
  | 'latest_version-asc'
  | 'latest_version-desc'
  | 'description-asc'
  | 'description-desc'
  | 'owner.name-asc'
  | 'owner.name-desc'
  | 'last_updated_time-asc'
  | 'last_updated_time-desc';
