/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import { EuiSpacer } from '@elastic/eui';
import React, { useState } from 'react';

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
  EuiSelect,
  EuiSuperSelect,
  EuiHealth,
  EuiComboBoxOptionOption,
} from '@elastic/eui';
import { htmlIdGenerator } from '@elastic/eui';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../../common/router';
export function RegisterModelTypeModal(props: any) {
  const { getMsg } = props;
  const msg: string = 'close';
  const [isModalVisible, setIsModalVisible] = useState(false);

  const closeModal = () => setIsModalVisible(false);
  const showModal = () => setIsModalVisible(true);
  const radioName = htmlIdGenerator()();
  const [radio, setRadio] = useState('radio2');
  const [nestedRadio, setNestedRadio] = useState('nestedRadio1');
  const radios = [
    {
      id: 'radios0',
      label: 'Option one',
    },
    {
      id: 'radios1',
      label: 'Option two',
    },
    {
      id: 'radios2',
      label: 'Option three',
      disabled: true,
    },
  ];
  const nestedRadios = [
    {
      id: 'nestedRadio1',
      label: 'Nested option one',
    },
    {
      id: 'nestedRadio2',
      label: 'Nested option two',
    },
    {
      id: 'nestedRadio3',
      label: 'Nested option three',
    },
  ];
  let modal;
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
  // const options = [
  //   { value: 'option_one', text: 'Option one' },
  //   { value: 'option_two', text: 'Option two' },
  //   { value: 'option_three', text: 'Option three' },
  // ];
  const onChange = (selectedOptions: EuiComboBoxOptionOption[]) => {
    // We should only get back either 0 or 1 options.
    setSelected(selectedOptions);
  };
  const [selectedOptions, setSelected] = useState<EuiComboBoxOptionOption[]>([]);
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
                  value="radio1"
                  checked={radio === 'radio1'}
                  onChange={() => setRadio('radio1')}
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
                  value="radio2"
                  checked={radio === 'radio2'}
                  onChange={() => setRadio('radio2')}
                />
              </EuiFlexItem>
            </EuiFlexGroup>
          </div>
        </EuiModalBody>
        <EuiSpacer />
        <EuiSpacer />
        <EuiModalBody style={{ display: radio === 'radio1' ? 'block' : 'none' }}>
          <strong>Select model from repository</strong>
          <EuiSpacer />
          <EuiComboBox
            placeholder="Select modal"
            singleSelection={{ asPlainText: true }}
            options={options}
            selectedOptions={selectedOptions}
            onChange={onChange}
          />

          {/* <EuiSuperSelect
            options={options}
            valueOfSelected={value}
            onChange={(value) => onChange(value)}
          /> */}
          {/* <EuiSelect
            id="selectDocExample"
            options={options}
            value={value}
            onChange={(e) => onChange(e)}
            aria-label="Use aria labels when no actual label is in use"
            hasNoInitialSelection={true}
            placeholder="Select modal"
          /> */}
        </EuiModalBody>
        <EuiModalFooter>
          <EuiButton color="primary" iconSide="right" onClick={() => getMsg(msg)}>
            {/* <EuiButton color="primary" iconSide="right" onClick={() => getMsg(msg)}> */}
            Cancle
          </EuiButton>

          <Link
            to={
              radio === 'radio1'
                ? `/model-registry/register-model?name=${selectedOptions[0]?.label}&version=${selectedOptions[0]?.label}`
                : '/model-registry/register-model'
            }
          >
            <EuiButton color="primary" fill iconSide="right" onClick={() => {}}>
              Continue
            </EuiButton>
          </Link>
        </EuiModalFooter>
        {/* <div>{{selectedOptions}}</div> */}
      </EuiModal>
    </div>
  );
}
