/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import { EuiSpacer } from '@elastic/eui';
import React, { useState, useCallback } from 'react';
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
  EuiComboBox,
  EuiComboBoxOptionOption,
  EuiTextColor,
  EuiLink,
} from '@elastic/eui';
import { htmlIdGenerator } from '@elastic/eui';
import { routerPaths } from '../../../common/router_paths';
enum ModelSource {
  USER_MODEL = 'UserModel',
  PRE_TRAINED_MODEL = 'PreTrainedModel',
}
interface RegisterModelTypeProps {
  onCloseModal: () => void;
}
export function RegisterModelTypeModal(props: RegisterModelTypeProps) {
  const { onCloseModal } = props;
  const history = useHistory();
  const [modelSource, setModelSource] = useState<ModelSource>(ModelSource.PRE_TRAINED_MODEL);
  const [modelRepoSelection, setModelRepoSelection] = useState<EuiComboBoxOptionOption[]>([]);
  const options = [
    {
      label: 'Titan',
      'data-test-subj': 'titanOption',
    },
  ];
  const onChange = useCallback((modelSelection: EuiComboBoxOptionOption[]) => {
    setModelRepoSelection(modelSelection);
  }, []);
  const handleContinue = useCallback(() => {
    switch (modelSource) {
      case ModelSource.USER_MODEL:
        if (modelRepoSelection[0]?.label) {
          history.push(
            `${routerPaths.registerModel}?name=${modelRepoSelection[0]?.label}&version=${modelRepoSelection[0]?.label}`
          );
        }
        break;
      case ModelSource.PRE_TRAINED_MODEL:
        history.push(routerPaths.registerModel);
        break;
    }
  }, [history, modelSource, modelRepoSelection]);
  return (
    <div>
      <EuiModal onClose={() => onCloseModal()} maxWidth="1000px">
        <EuiModalHeader>
          <EuiModalHeaderTitle>
            <h1>Register new model</h1>
          </EuiModalHeaderTitle>
        </EuiModalHeader>
        <EuiModalBody>
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
                        Select from a curated list of relevant pre-trained machine learning models.
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
                        Import your own model in Torchscript file format.Lorem ipsum dolar sit amet
                        consecuter.
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
        </EuiModalBody>
        <EuiSpacer />
        <EuiSpacer />
        <EuiModalBody
          style={{ display: modelSource === ModelSource.USER_MODEL ? 'block' : 'none' }}
        >
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

          <EuiComboBox
            placeholder="Select model"
            singleSelection={{ asPlainText: true }}
            options={options}
            selectedOptions={modelRepoSelection}
            onChange={onChange}
            aria-label="Select model"
          />
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
