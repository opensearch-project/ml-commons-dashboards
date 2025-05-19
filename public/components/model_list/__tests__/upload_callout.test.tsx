/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { UploadCallout } from '../upload_callout';

import { render, screen } from '../../../../test/test_utils';

describe('<UploadCallout />', () => {
  it('should display consistent call title and content', () => {
    render(<UploadCallout models={['image-classifier']} />);
    expect(screen.getByText('1 upload in progress'));
    expect(screen.getByText('image-classifier is uploading to the model registry.'));
  });
});
