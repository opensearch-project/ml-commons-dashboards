/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import { EuiSpacer } from '@elastic/eui';
import React, { useState, useCallback, Fragment } from 'react';
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
} from '@elastic/eui';
import { htmlIdGenerator } from '@elastic/eui';
import { i18n } from '@osd/i18n';
import { routerPaths } from '../../../common/router_paths';
enum ModelSource {
  USER_MODEL = 'UserModel',
  PRE_TRAINED_MODEL = 'PreTrainedModel',
}
interface RegisterModelTypeProps {
  onCloseModal: () => void;
}
interface OptionsType {
  label: string;
  'data-test-subj'?: string;
  checked?: string;
}
export function RegisterModelTypeModal(props: RegisterModelTypeProps) {
  const { onCloseModal } = props;
  const history = useHistory();
  const [modelSource, setModelSource] = useState<ModelSource>(ModelSource.PRE_TRAINED_MODEL);
  const options = [
    {
      label: 'Titan',
      'data-test-subj': 'titanOption',
    },
    {
      label: 'WSSS',
    },
    {
      label: 'T33',
    },
  ];
  const [modelRepoSelection, setModelRepoSelection] = useState(options);
  const onChange = useCallback((modelSelection: OptionsType[]) => {
    let selectedOption: OptionsType = { label: '' };
    setModelRepoSelection(modelSelection);
    modelSelection.map((u: OptionsType) => {
      if (u.checked) {
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
            <h1>Register new model</h1>
          </EuiModalHeaderTitle>
        </EuiModalHeader>
        <EuiModalBody>
          <div style={{ overflow: 'hidden' }}>
            <EuiText size="s">
              <strong>Select source</strong>
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
                          Select from a curated list of relevant pre-trained machine learning
                          models.
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
                          Import your own model in Torchscript file format.Lorem ipsum dolar sit
                          amet consecuter.
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
              <strong>Select model from repository</strong>
            </small>
            <EuiSpacer size="m" />
            <div>
              <small>Lorem ipsum dolor sit amet consecetur lorem ipsum dolor.</small>
              <small>
                <EuiLink href="#" external>
                  Learn more
                </EuiLink>
              </small>
            </div>
            <EuiSpacer size="s" />
            <EuiSelectable
              aria-label="Searchable example"
              searchable
              searchProps={{
                'data-test-subj': 'selectableSearchHere',
                placeholder: i18n.translate(
                  'indexPatternManagement.createIndexPattern.stepDataSource.searchPlaceHolder',
                  {
                    defaultMessage: 'Filter options',
                  }
                ),
              }}
              options={modelRepoSelection}
              onChange={onChange}
              singleSelection={true}
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
          {/* <EuiButton color="primary" fill onClick={handleContinue} data-test-subj="continue button">
            Continue
          </EuiButton> */}
          <EuiButton color="primary" fill onClick={handleContinue} data-test-subj="continue button">
            Continue
          </EuiButton>
        </EuiModalFooter>
      </EuiModal>
    </div>
  );
}
