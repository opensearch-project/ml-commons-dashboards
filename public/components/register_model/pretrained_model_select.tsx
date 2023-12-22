/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, Fragment } from 'react';
import {
  EuiSpacer,
  EuiTextColor,
  EuiSelectable,
  EuiLink,
  EuiSelectableOption,
  EuiHighlight,
} from '@elastic/eui';
import { useHistory, generatePath } from 'react-router-dom';
import { useObservable } from 'react-use';

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
export const PreTrainedModelSelect = ({
  checkedPreTrainedModel,
}: {
  checkedPreTrainedModel?: string;
}) => {
  const preTrainedModels = useObservable(modelRepositoryManager.getPreTrainedModels$());
  const preTrainedModelOptions = preTrainedModels
    ? Object.keys(preTrainedModels).map((name) => ({
        label: name,
        description: preTrainedModels[name].description,
        checked: checkedPreTrainedModel === name ? ('on' as const) : undefined,
      }))
    : [];

  const history = useHistory();
  const onChange = useCallback(
    (options: Array<EuiSelectableOption<IItem>>) => {
      const selectedOption = options.find((option) => option.checked === 'on');

      if (selectedOption?.label) {
        history.push(
          `${generatePath(routerPaths.registerModel, { id: undefined })}/?type=import&name=${
            selectedOption.label
          }`
        );
      }
    },
    [history]
  );

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
        options={preTrainedModelOptions}
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
        isLoading={!preTrainedModels}
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
