/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback } from 'react';
import {
  EuiSpacer,
  EuiTextColor,
  EuiLink,
  EuiHighlight,
  EuiComboBox,
  EuiComboBoxProps,
} from '@elastic/eui';
import { useHistory, generatePath } from 'react-router-dom';
import { useObservable } from 'react-use';

import { modelRepositoryManager } from '../../utils/model_repository_manager';
import { routerPaths } from '../../../common/router_paths';
import { useSearchParams } from '../../hooks/use_search_params';

type PreTrainedModelProps = Required<EuiComboBoxProps<{ name: string; description: string }>>;

const renderOption: PreTrainedModelProps['renderOption'] = (option, searchValue) => (
  <>
    {option.value && <EuiHighlight search={searchValue}>{option.value?.name}</EuiHighlight>}
    <br />
    {option.value && (
      <EuiTextColor color="subdued">
        <small>
          <EuiHighlight search={searchValue}>{option.value.description}</EuiHighlight>
        </small>
      </EuiTextColor>
    )}
  </>
);

export const PreTrainedModelSelect = () => {
  const searchParams = useSearchParams();
  const nameParams = searchParams.get('name');
  const preTrainedModels = useObservable(modelRepositoryManager.getPreTrainedModels$());
  const preTrainedModelOptions = preTrainedModels
    ? Object.keys(preTrainedModels).map((name) => ({
        label: name,
        value: { name, description: preTrainedModels[name].description },
      }))
    : [];

  const history = useHistory();
  const onChange = useCallback<PreTrainedModelProps['onChange']>(
    (options) => {
      if (options[0].value) {
        history.push(
          `${generatePath(routerPaths.registerModel, { id: undefined })}/?type=import&name=${
            options[0].value.name
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
      <EuiComboBox
        options={preTrainedModelOptions}
        selectedOptions={nameParams ? [{ label: nameParams }] : []}
        singleSelection
        placeholder="Find model"
        rowHeight={50}
        renderOption={renderOption}
        onChange={onChange}
        isClearable={false}
      />
    </div>
  );
};
