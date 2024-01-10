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
  EuiTextColor,
} from '@elastic/eui';
import { htmlIdGenerator } from '@elastic/eui';
import { generatePath } from 'react-router-dom';
import { routerPaths } from '../../../common/router_paths';

enum ModelSource {
  USER_MODEL = 'UserModel',
  PRE_TRAINED_MODEL = 'PreTrainedModel',
  EXTERNAL_MODEL = 'External_Model',
}
interface Props {
  onCloseModal: () => void;
}

export function RegisterModelTypeModal({ onCloseModal }: Props) {
  const history = useHistory();
  const [modelSource, setModelSource] = useState<ModelSource>(ModelSource.PRE_TRAINED_MODEL);
  const handleContinue = useCallback(() => {
    switch (modelSource) {
      case ModelSource.PRE_TRAINED_MODEL:
        history.push(`${generatePath(routerPaths.registerModel, { id: undefined })}/?type=import`);
        break;
      case ModelSource.USER_MODEL:
        history.push(`${generatePath(routerPaths.registerModel, { id: undefined })}/?type=upload`);
        break;
      case ModelSource.EXTERNAL_MODEL:
        history.push(
          `${generatePath(routerPaths.registerModel, { id: undefined })}/?type=external`
        );
        break;
    }
  }, [history, modelSource]);

  return (
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
                checked={modelSource === ModelSource.PRE_TRAINED_MODEL}
                onChange={() => setModelSource(ModelSource.PRE_TRAINED_MODEL)}
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
                checked={modelSource === ModelSource.USER_MODEL}
                onChange={() => setModelSource(ModelSource.USER_MODEL)}
              />
            </EuiFlexItem>
            <EuiFlexItem>
              <EuiCheckableCard
                id={htmlIdGenerator()()}
                label={
                  <div>
                    <span style={{ fontSize: 20 }}>External source</span>
                    <EuiSpacer />
                    <EuiTextColor color="subdued" style={{ lineHeight: '22px' }}>
                      <small>Connect to an external source with a connector.</small>
                    </EuiTextColor>
                  </div>
                }
                aria-label="External source"
                checked={modelSource === ModelSource.EXTERNAL_MODEL}
                onChange={() => setModelSource(ModelSource.EXTERNAL_MODEL)}
              />
            </EuiFlexItem>
          </EuiFlexGroup>
        </div>
        <EuiSpacer />
        <EuiSpacer />
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
        <EuiButton color="primary" fill onClick={handleContinue} data-test-subj="continueRegister">
          Continue
        </EuiButton>
      </EuiModalFooter>
    </EuiModal>
  );
}
