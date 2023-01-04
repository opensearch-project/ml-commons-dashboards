/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState } from 'react';

import { EuiFieldSearch } from '@elastic/eui';

export const SearchBar = () => {
  const [value, setValue] = useState('');

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };

  return (
    /* DisplayToggles wrapper for Docs only */
    <div>
      <div>
        hello
        <EuiFieldSearch
          placeholder="Search by name or ID"
          value={value}
          onChange={onChange}
          aria-label="Use aria labels when no actual label is in use"
          fullWidth
        />
      </div>
    </div>
  );
};
