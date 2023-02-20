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
  EuiSelectableOption,
  EuiHighlight,
} from '@elastic/eui';
import { htmlIdGenerator } from '@elastic/eui';
import { generatePath } from 'react-router-dom';
import { routerPaths } from '../../../common/router_paths';
enum ModelSource {
  USER_MODEL = 'UserModel',
  PRE_TRAINED_MODEL = 'PreTrainedModel',
}
interface Props {
  onCloseModal: () => void;
}
interface IItem {
  label: string;
  checked?: 'on' | undefined;
  description: string;
}
const MODEL_LIST = [
  {
    name: 'tapas-tiny',
    description:
      'TAPAS is a BERT-like transformers model pretrained on a large corpus of English data from Wikipedia in a self-supervised fashion',
    checked: undefined,
  },
  {
    name: 'electra-small-generator',
    description: 'ELECTRA is a new method for self-supervised language representation learning',
    checked: undefined,
  },
  {
    name: 'flan-T5-large-grammer-synthesis',
    description:
      'A fine-tuned version of google/flan-t5-large for grammer correction on an expanded version of the JFLEG dataset',
    checked: undefined,
  },
  {
    name: 'BEiT',
    description:
      'The BEiT model is a version Transformer(ViT),which is a transformer encoder model(BERT-like)',
    checked: undefined,
  },
];
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
export function RegisterModelTypeModal({ onCloseModal }: Props) {
  const [modelRepoSelection, setModelRepoSelection] = useState<Array<EuiSelectableOption<IItem>>>(
    () =>
      MODEL_LIST.map((item) => ({
        checked: item.checked,
        label: item.name,
        description: item.description,
      }))
  );
  const customProps = {
    height: 240,
    renderOption: renderModelOption,
    listProps: {
      rowHeight: 50,
      'data-test-subj': 'opensearchModelList',
      showIcons: true,
    },
  };
  const history = useHistory();
  const [modelSource, setModelSource] = useState<ModelSource>(ModelSource.PRE_TRAINED_MODEL);
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
              `${generatePath(routerPaths.registerModel, { id: undefined })}/?type=import&name=${
                selectedOption?.label
              }&version=${selectedOption?.label}`
            );
          }
          break;
        case ModelSource.PRE_TRAINED_MODEL:
          history.push(
            `${generatePath(routerPaths.registerModel, { id: undefined })}/?type=upload`
          );
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
            data-test-subj="cancelRegister"
          >
            Cancel
          </EuiButton>
          <EuiButton
            color="primary"
            fill
            onClick={handleContinue}
            data-test-subj="continueRegister"
          >
            Continue
          </EuiButton>
        </EuiModalFooter>
      </EuiModal>
    </div>
  );
}
