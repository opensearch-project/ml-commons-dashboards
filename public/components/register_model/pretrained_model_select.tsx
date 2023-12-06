/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useState, Fragment, useEffect } from 'react';
import {
  EuiSpacer,
  EuiTextColor,
  EuiSelectable,
  EuiLink,
  EuiSelectableOption,
  EuiHighlight,
} from '@elastic/eui';
import { useHistory } from 'react-router-dom';
import { generatePath } from 'react-router-dom';
import { modelRepositoryManager } from '../../utils/model_repository_manager';
import { routerPaths } from '../../../common/router_paths';
interface IItem {
  label: string;
  checked?: 'on' | undefined;
  description: string;
}
const renderModelOption = (option: IItem, searchValue: string) => {
  return (
    <>
      <EuiHighlight search={searchValue}>{option.label}</EuiHighlight>
      <br />
      <EuiTextColor color="subdued">
        <small>
          <EuiHighlight search={searchValue}>{option.description}</EuiHighlight>
        </small>
      </EuiTextColor>
    </>
  );
};
export const PreTrainedModelSelect = () => {
  useEffect(() => {
    const subscribe = modelRepositoryManager.getPreTrainedModels$().subscribe((models) => {
      setModelRepoSelection(
        Object.keys(models).map((name) => ({
          label: name,
          description: models[name].description,
          checked: undefined,
        }))
      );
    });
    return () => {
      subscribe.unsubscribe();
    };
  }, []);
  const [modelRepoSelection, setModelRepoSelection] = useState<Array<EuiSelectableOption<IItem>>>(
    []
  );
  const history = useHistory();
  const onChange = useCallback(
    (modelSelection: Array<EuiSelectableOption<IItem>>) => {
      setModelRepoSelection(modelSelection);
      // ShowRest(true);
    },
    // [ShowRest]
    []
  );
  useEffect(() => {
    const selectedOption = modelRepoSelection.find((option) => option.checked === 'on');
    if (selectedOption?.label) {
      history.push(
        `${generatePath(routerPaths.registerModel, { id: undefined })}/?type=import&name=${
          selectedOption?.label
        }`
      );
    }
  }, [modelRepoSelection, history]);
  return (
    <div>
      <small>
        <strong>Model</strong>
      </small>
      <EuiSpacer size="s" />
      <div>
        <EuiTextColor color="subdued">
          <small>For more information on each model, see </small>
        </EuiTextColor>
        <small>
          <EuiLink href="#" external>
            OpenSearch model repository documentation
          </EuiLink>
        </small>
      </div>
      <EuiSpacer size="m" />
      <EuiSelectable
        aria-label="OpenSearch model repository models"
        searchable
        searchProps={{
          'data-test-subj': 'findModel',
          placeholder: 'Find model',
        }}
        options={modelRepoSelection}
        onChange={onChange}
        singleSelection={true}
        noMatchesMessage="No model found"
        height={240}
        renderOption={renderModelOption}
        listProps={{
          rowHeight: 50,
          'data-test-subj': 'opensearchModelList',
          showIcons: true,
        }}
        isLoading={modelRepoSelection.length === 0}
      >
        {(list, search) => (
          <Fragment>
            {search}
            {list}
          </Fragment>
        )}
      </EuiSelectable>
    </div>
  );
};
