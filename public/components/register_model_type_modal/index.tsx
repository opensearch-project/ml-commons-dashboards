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
import { Link } from 'react-router-dom';

export function RegisterModelTypeModal(props: any) {
  const { getMsg } = props;
  const msg: string = 'close';
  const radioName = htmlIdGenerator()();
  const [radio, setRadio] = useState('ownModal');
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
  const onChange = (selectedOptions: EuiComboBoxOptionOption[]) => {
    // We should only get back either 0 or 1 options.
    setSelected(selectedOptions);
  };
  const history = useHistory();
  const [selectedOptions, setSelected] = useState<EuiComboBoxOptionOption[]>([]);
  const handleContinue = (radioSelected: any) => {
    if (radioSelected === 'fromRepo') {
      history.push(
        `/model-registry/register-model?name=${selectedOptions[0]?.label}&version=${selectedOptions[0]?.label}`
      );
    } else {
      history.push('/model-registry/register-model');
    }
  };
  return (
    <div>
      <EuiModal onClose={() => getMsg(msg)} maxWidth="1000px">
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
                  name={radioName}
                  value="fromRepo"
                  checked={radio === 'fromRepo'}
                  onChange={() => setRadio('fromRepo')}
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
                  name={radioName}
                  value="ownModal"
                  checked={radio === 'ownModal'}
                  onChange={() => setRadio('ownModal')}
                />
              </EuiFlexItem>
            </EuiFlexGroup>
          </div>
        </EuiModalBody>
        <EuiSpacer />
        <EuiSpacer />
        <EuiModalBody style={{ display: radio === 'fromRepo' ? 'block' : 'none' }}>
          <strong>Select model from repository</strong>
          <EuiSpacer />
          <EuiComboBox
            placeholder="Select modal"
            singleSelection={{ asPlainText: true }}
            options={options}
            selectedOptions={selectedOptions}
            onChange={onChange}
          />
        </EuiModalBody>
        <EuiModalFooter>
          <EuiButton color="primary" iconSide="right" onClick={() => getMsg(msg)}>
            {/* <EuiButton color="primary" iconSide="right" onClick={() => getMsg(msg)}> */}
            Cancle
          </EuiButton>
          <EuiButton
            color="primary"
            fill
            iconSide="right"
            onClick={() => {
              handleContinue(radio);
            }}
          >
            Continue
          </EuiButton>
        </EuiModalFooter>
        {/* <div>{{selectedOptions}}</div> */}
      </EuiModal>
    </div>
  );
}
