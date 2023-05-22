/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { EuiSpacer, EuiText, EuiLink } from '@elastic/eui';
import { useParams } from 'react-router-dom';

import { useModelTags } from './register_model.hooks';
import { ModelTagArrayField } from '../common/forms/model_tag_array_field';

const MAX_TAG_NUM = 10;

export const ModelTagsPanel = () => {
  const { id: latestVersionId } = useParams<{ id: string | undefined }>();
  const [, tags] = useModelTags();
  const isRegisterNewVersion = !!latestVersionId;
  const maxTagNum = isRegisterNewVersion ? tags.length : MAX_TAG_NUM;

  return (
    <div>
      <EuiText size="s">
        <h3>
          Tags - <i style={{ fontWeight: 300 }}>optional</i>
        </h3>
      </EuiText>
      <EuiText style={{ maxWidth: 725 }}>
        <small>
          {isRegisterNewVersion ? (
            <>
              Add tags to help your organization discover and compare models, and track information
              related to new versions of this model, such as evaluation metrics.
            </>
          ) : (
            <>
              Add tags to help your organization discover, compare, and track information related to
              your model. The tag keys used here will define the available keys for all versions of
              this model.{' '}
              <EuiLink external href="#">
                Learn more
              </EuiLink>
              .
            </>
          )}
        </small>
      </EuiText>
      <EuiSpacer size="m" />
      <ModelTagArrayField tags={tags} allowKeyCreate={!latestVersionId} maxTagNum={maxTagNum} />
    </div>
  );
};
