/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import { EuiSpacer } from '@elastic/eui';
import React, { useState, useCallback, Fragment, useMemo } from 'react';
import { useHistory } from 'react-router-dom';
import {
  EuiButton,
  EuiModal,
  EuiModalBody,
  EuiModalFooter,
  EuiModalHeader,
  EuiModalHeaderTitle,
  EuiFlexGroup,
  EuiFlexItem,
  EuiCheckableCard,
  EuiText,
  EuiSelectable,
  EuiTextColor,
  EuiLink,
  EuiSelectableOption,
} from '@elastic/eui';
import { htmlIdGenerator } from '@elastic/eui';
import { routerPaths } from '../../../common/router_paths';
import { MODEL_FILTER, MODEL_VALUE } from '../../../common/registry_modal_option';
enum ModelSource {
  USER_MODEL = 'UserModel',
  PRE_TRAINED_MODEL = 'PreTrainedModel',
}
export interface IOption {
  value: MODEL_VALUE;
  checked: 'on' | undefined;
}
interface Props {
  options: IOption[];
  onCloseModal: () => void;
}
export interface IItem {
  label: string;
  'data-test-subj': string;
  checked?: 'on' | undefined;
  value: MODEL_VALUE;
}

export function RegisterModelTypeModal({ onCloseModal, options }: Props) {
  const items = useMemo<IItem[]>(() => {
    return options.map((item) => {
      const status = MODEL_FILTER.find((option) => option.value === item.value);
      return {
        ...item,
        label: status!.label,
        'data-test-subj': status!['data-test-subj'],
      };
    });
  }, [options]);
  const history = useHistory();
  const [modelSource, setModelSource] = useState<ModelSource>(ModelSource.PRE_TRAINED_MODEL);
  const [modelRepoSelection, setModelRepoSelection] = useState<Array<EuiSelectableOption<IItem>>>(
    items
  );
  const onChange = useCallback((modelSelection: Array<EuiSelectableOption<IItem>>) => {
    let selectedOption = {};
    setModelRepoSelection(modelSelection);
    modelSelection.map((u: IItem) => {
      if (u.checked === 'on') {
        selectedOption = u;
      }
    });
    return selectedOption;
  }, []);

  const handleContinue = useCallback(
    (selectedOption) => {
      selectedOption = onChange(modelRepoSelection);
      switch (modelSource) {
        case ModelSource.USER_MODEL:
          if (selectedOption?.label) {
            history.push(
              `${routerPaths.registerModel}?name=${selectedOption?.label}&version=${selectedOption?.label}`
            );
          }
          break;
        case ModelSource.PRE_TRAINED_MODEL:
          history.push(routerPaths.registerModel);
          break;
      }
    },
    [history, modelSource, modelRepoSelection, onChange]
  );
  return (
    <div>
      <EuiModal onClose={() => onCloseModal()} maxWidth="1000px">
        <EuiModalHeader>
          <EuiModalHeaderTitle>
            <h1>Register model</h1>
          </EuiModalHeaderTitle>
        </EuiModalHeader>
        <EuiModalBody>
          <div style={{ overflow: 'hidden' }}>
            <EuiText size="s">
              <strong>Model source</strong>
            </EuiText>
            <EuiFlexGroup gutterSize="l">
              <EuiFlexItem>
                <EuiCheckableCard
                  id={htmlIdGenerator()()}
                  label={
                    <div>
                      <span style={{ fontSize: 20 }}>Opensearch model repository</span>
                      <EuiSpacer />
                      <EuiTextColor color="subdued" style={{ lineHeight: '22px' }}>
                        <small>
                          Select from a curated list of pre-trained models for search use cases.
                        </small>
                      </EuiTextColor>
                    </div>
                  }
                  aria-label="Opensearch model repository"
                  checked={modelSource === ModelSource.USER_MODEL}
                  onChange={() => setModelSource(ModelSource.USER_MODEL)}
                />
              </EuiFlexItem>
              <EuiFlexItem>
                <EuiCheckableCard
                  id={htmlIdGenerator()()}
                  label={
                    <div>
                      <span style={{ fontSize: 20 }}>Add your own model</span>
                      <EuiSpacer />
                      <EuiTextColor color="subdued" style={{ lineHeight: '22px' }}>
                        <small>
                          Upload your own model in Torchscript format, as a local file via URL.
                        </small>
                      </EuiTextColor>
                    </div>
                  }
                  aria-label="Add your own model"
                  checked={modelSource === ModelSource.PRE_TRAINED_MODEL}
                  onChange={() => setModelSource(ModelSource.PRE_TRAINED_MODEL)}
                />
              </EuiFlexItem>
            </EuiFlexGroup>
          </div>
          <EuiSpacer />
          <EuiSpacer />
          <div style={{ display: modelSource === ModelSource.USER_MODEL ? 'block' : 'none' }}>
            <small>
              <strong>Model</strong>
            </small>
            <EuiSpacer size="m" />
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
            <EuiSpacer size="s" />
            <EuiSelectable
              aria-label="Searchable"
              searchable
              searchProps={{
                'data-test-subj': 'selectableSearchHere',
                placeholder: 'Find model',
              }}
              options={modelRepoSelection}
              onChange={onChange}
              singleSelection={true}
              noMatchesMessage="No model found"
              listProps={{ onFocusBadge: false, 'data-test-subj': 'selectableListHere' }}
            >
              {(list, search) => (
                <Fragment>
                  {search}
                  {list}
                </Fragment>
              )}
            </EuiSelectable>
          </div>
        </EuiModalBody>
        <EuiModalFooter>
          <EuiButton
            color="primary"
            iconSide="right"
            onClick={onCloseModal}
            data-test-subj="cancel button"
          >
            Cancel
          </EuiButton>
          <EuiButton color="primary" fill onClick={handleContinue} data-test-subj="continue button">
            Continue
          </EuiButton>
        </EuiModalFooter>
      </EuiModal>
    </div>
  );
}
