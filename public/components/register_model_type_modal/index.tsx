/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import { EuiSpacer } from '@elastic/eui';
import React, { useState } from 'react';
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
} from '@elastic/eui';
import { htmlIdGenerator } from '@elastic/eui';
enum ModelSource {
  USER_MODEL = 'UserModel',
  PRE_TRAINED_MODEL = 'PreTrainedModel',
}
export interface RegisterModelTypeProp {
  onCloseModal: () => void;
}
export function RegisterModelTypeModal(props: RegisterModelTypeProp) {
  const { onCloseModal } = props;
  const history = useHistory();
  const [modelSource, setModelSource] = useState<ModelSource>(ModelSource.PRE_TRAINED_MODEL);
  const options = [
    {
      label: 'Titan',
      'data-test-subj': 'titanOption',
    },
    {
      label: 'Enceladus',
    },
    {
      label: 'Mimas',
    },
    {
      label: 'Dione',
    },
    {
      label: 'Iapetus',
    },
    {
      label: 'Phoebe',
    },
    {
      label: 'Rhea',
    },
    {
      label: "Pandora is one of Saturn's moons, named for a Titaness of Greek mythology",
    },
    {
      label: 'Tethys',
    },
    {
      label: 'Hyperion',
    },
  ];
  const onChange = (modelRepoSelection: EuiComboBoxOptionOption[]) => {
    // We should only get back either 0 or 1 options.
    setmodelRepoSelection(modelRepoSelection);
  };
  const [modelRepoSelection, setmodelRepoSelection] = useState<EuiComboBoxOptionOption[]>([]);
  const handleContinue = (radioSelected: string) => {
    if (radioSelected === 'UserModel' && modelRepoSelection[0]?.label) {
      history.push(
        `/model-registry/register-model?name=${modelRepoSelection[0]?.label}&version=${modelRepoSelection[0]?.label}`
      );
    } else if (radioSelected === 'PreTrainedModel') {
      history.push('/model-registry/register-model');
    }
  };
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
            <EuiText>
              <strong>Select source</strong>
            </EuiText>
            <EuiFlexGroup gutterSize="l">
              <EuiFlexItem>
                <EuiCheckableCard
                  id={htmlIdGenerator()()}
                  label={
                    <div>
                      <span style={{ fontWeight: 500 }}>Opensearch model repository</span>
                      <EuiSpacer />
                      <p style={{ color: 'gray' }}>
                        Select from a curated list of relevant pre-trained machine learning models
                      </p>
                    </div>
                  }
                  checked={modelSource === ModelSource.USER_MODEL}
                  onChange={() => setModelSource(ModelSource.USER_MODEL)}
                />
              </EuiFlexItem>
              <EuiFlexItem>
                <EuiCheckableCard
                  id={htmlIdGenerator()()}
                  label={
                    <div>
                      <span style={{ fontWeight: 500 }}>Add your own model</span>
                      <EuiSpacer />
                      <p style={{ color: 'gray' }}>
                        Import your own model in Torchscript file format.Lorem ipsum dolar sit amet
                        consecuter.
                      </p>
                    </div>
                  }
                  checked={modelSource === ModelSource.PRE_TRAINED_MODEL}
                  onChange={() => setModelSource(ModelSource.PRE_TRAINED_MODEL)}
                />
              </EuiFlexItem>
            </EuiFlexGroup>
          </div>
        </EuiModalBody>
        <EuiSpacer />
        <EuiSpacer />
        <EuiModalBody
          style={{ display: modelSource === ModelSource.USER_MODEL ? 'block' : 'none' }}
        >
          <strong>Select model from repository</strong>
          <EuiSpacer />
          <EuiComboBox
            placeholder="Select modal"
            singleSelection={{ asPlainText: true }}
            options={options}
            selectedOptions={modelRepoSelection}
            onChange={onChange}
          />
        </EuiModalBody>
        <EuiModalFooter>
          <EuiButton color="primary" iconSide="right" onClick={() => onCloseModal()}>
            Cancel
          </EuiButton>
          <EuiButton
            color="primary"
            fill
            onClick={() => {
              handleContinue(modelSource);
            }}
          >
            Continue
          </EuiButton>
        </EuiModalFooter>
      </EuiModal>
    </div>
  );
}
