/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

export interface OpenSearchSecurityAccount {
  user_name: string;
  is_reserved: boolean;
  is_hidden: boolean;
  is_interval_user: boolean;
  user_required_tenant: null;
  backed_roles: string[];
  custom_attribute_names: string[];
  tenants: {
    global_tenant: boolean;
    admin_tenant: true;
    admin: true;
  };
  roles: string[];
}
