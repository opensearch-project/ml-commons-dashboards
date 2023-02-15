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
  EuiHighlight,
} from '@elastic/eui';
import { htmlIdGenerator } from '@elastic/eui';
import { routerPaths } from '../../../common/router_paths';

enum ModelSource {
  USER_MODEL = 'UserModel',
  PRE_TRAINED_MODEL = 'PreTrainedModel',
}
export interface IOption {
  name: string;
  checked?: 'on' | undefined;
  description: string;
}
interface Props {
  options: IOption[];
  onCloseModal: () => void;
}
export interface IItem {
  label: string;
  checked?: 'on' | undefined;

  description: string;
}

export function RegisterModelTypeModal({ onCloseModal, options }: Props) {
  const items = useMemo<IItem[]>(() => {
    return options.map((item) => {
      return {
        checked: item.checked,
        label: item.name,
        description: item.description,
      };
    });
  }, [options]);
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

  const customProps = {
    height: 240,
    renderOption: renderModelOption,
    listProps: {
      rowHeight: 50,
      // showIcons: false,
      'data-test-subj': 'selectableListHere',
      showIcons: true,
    },
  };
  const history = useHistory();
  const [modelSource, setModelSource] = useState<ModelSource>(ModelSource.PRE_TRAINED_MODEL);
  const [modelRepoSelection, setModelRepoSelection] = useState<Array<EuiSelectableOption<IItem>>>(
    items
  );
  const onChange = useCallback((modelSelection: Array<EuiSelectableOption<IItem>>) => {
    setModelRepoSelection(modelSelection);
  }, []);
  const handleContinue = useCallback(
    (selectedOption) => {
      selectedOption = onChange(modelRepoSelection);
      switch (modelSource) {
        case ModelSource.USER_MODEL:
          selectedOption = modelRepoSelection.find((option) => option.checked === 'on');
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
              {...customProps}
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
