/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useMemo } from 'react';
import { EuiButton } from '@elastic/eui';
import { ModelFilter, ModelFilterProps } from './model_filter';
import { useFetcher } from '../../hooks/use_fetcher';
import { APIProvider } from '../../apis/api_provider';

const ownerFetcher = () => Promise.resolve(['admin', 'owner-1', 'owner-2']);

export const OwnerFilter = ({ value, onChange }: Pick<ModelFilterProps, 'value' | 'onChange'>) => {
  const { data: accountData } = useFetcher(APIProvider.getAPI('security').getAccount);
  const { data: ownerData } = useFetcher(ownerFetcher);
  const currentAccountName = accountData?.user_name;
  const options = useMemo(
    () =>
      (ownerData ?? []).map((owner) => ({
        name: owner === currentAccountName ? `${owner} (Me)` : owner,
        value: owner,
      })),
    [ownerData, currentAccountName]
  );

  const handleOnlyMyModelsClick = useCallback(() => {
    if (!currentAccountName) {
      return;
    }
    onChange([currentAccountName]);
  }, [currentAccountName, onChange]);

  return (
    <ModelFilter
      searchPlaceholder="Search"
      options={options}
      value={value}
      name="Owner"
      onChange={onChange}
      footer={
        currentAccountName && (
          <EuiButton fullWidth size="s" onClick={handleOnlyMyModelsClick}>
            Show Only My Models
          </EuiButton>
        )
      }
    />
  );
};
