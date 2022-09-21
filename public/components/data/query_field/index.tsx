/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useCallback, useState, useLayoutEffect, useRef } from 'react';
import {
  EuiSelect,
  EuiSelectable,
  EuiSelectableOption,
  EuiBadge,
  EuiSpacer,
  EuiFormRow,
} from '@elastic/eui';
import { IndexPattern } from '../../../../../../src/plugins/data/public/index';
import { useOpenSearchDashboards } from '../../../../../../src/plugins/opensearch_dashboards_react/public/index';
import { MLServices } from '../../../types';
import { PLUGIN_ID } from '../../../../common';
import { buildOpenSearchQuery } from '../../../../../../src/plugins/data/common';

export interface Query {
  bool?: {
    [key: string]: any[];
  };
}

interface Props {
  indexPatterns: IndexPattern[];
  selectedFields: Record<string, string[]>;
  onSelectedFields: React.Dispatch<React.SetStateAction<Record<string, string[]>>>;
  onUpdateQuerys: React.Dispatch<React.SetStateAction<Query | undefined>>;
}

type FieldsOption = Partial<IndexPattern & EuiSelectableOption>;
export const QueryField = ({
  indexPatterns,
  selectedFields,
  onSelectedFields,
  onUpdateQuerys,
}: Props) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [fieldsOptions, setFieldsOptions] = useState<FieldsOption[]>([]);
  const onUpdateQuerysRef = useRef(onUpdateQuerys);
  onUpdateQuerysRef.current = onUpdateQuerys;
  const currentSelectedPatternRef = useRef(indexPatterns?.[selectedIndex]);
  currentSelectedPatternRef.current = indexPatterns?.[selectedIndex];
  const onSelectedFieldsRef = useRef(onSelectedFields);
  onSelectedFieldsRef.current = onSelectedFields;
  const { services } = useOpenSearchDashboards<MLServices>();
  const {
    setHeaderActionMenu,
    navigation: {
      ui: { TopNavMenu },
    },
    data,
  } = services;

  const handleSelectField = useCallback(
    (newOptions: FieldsOption[]) => {
      setFieldsOptions(newOptions);
      const fields = newOptions.filter((item) => item?.checked === 'on');
      const selectedFieldsLabels = fields.map((i) => i.label);
      const indexTitle = Object.keys(selectedFields)[0];
      onSelectedFieldsRef.current({ [indexTitle]: selectedFieldsLabels as string[] });
    },
    [selectedFields]
  );

  useEffect(() => {
    if (!indexPatterns || !indexPatterns[selectedIndex]) return;
    setFieldsOptions(
      indexPatterns[selectedIndex]?.fields.map((item) => ({
        ...item,
        label: item.name,
        prepend: <EuiBadge color="hollow">{item?.type}</EuiBadge>,
      }))
    );
    const indexTitle = indexPatterns[selectedIndex]?.title;
    onSelectedFieldsRef.current({ [indexTitle]: [] });
  }, [selectedIndex, indexPatterns]);

  useLayoutEffect(() => {
    const subscription = data.query.state$.subscribe(({ state }) => {
      if (state.filters && state.query) {
        const query = buildOpenSearchQuery(
          currentSelectedPatternRef.current,
          state.query,
          state.filters
        );
        onUpdateQuerysRef.current(query);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [data.query.state$]);

  return (
    <>
      <EuiFormRow label="Select index" fullWidth helpText="select a index which used to query">
        <EuiSelect
          options={indexPatterns?.map((i, index) => {
            return { value: index, text: i.title };
          })}
          value={selectedIndex}
          fullWidth
          onChange={(e) => {
            setSelectedIndex(Number(e.target.value));
          }}
        />
      </EuiFormRow>
      <EuiFormRow
        label="Select source fileds"
        fullWidth
        helpText="select fields which used to query"
      >
        <EuiSelectable
          aria-label="Searchable example"
          searchable
          searchProps={{
            'data-test-subj': 'selectableSearchHere',
          }}
          options={(fieldsOptions as unknown) as EuiSelectableOption[]}
          onChange={handleSelectField}
        >
          {(list, search) => (
            <>
              {search}
              {list}
            </>
          )}
        </EuiSelectable>
      </EuiFormRow>
      <EuiFormRow label="Filter" fullWidth helpText="add filter which used to query">
        <TopNavMenu
          appName={PLUGIN_ID}
          setMenuMountPoint={setHeaderActionMenu}
          indexPatterns={[indexPatterns[selectedIndex]]}
          useDefaultBehaviors={true}
          showQueryBar={false}
          showSearchBar={true}
        />
      </EuiFormRow>
    </>
  );
};
