/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState } from 'react';

import { EuiFieldSearch, EuiSwitch } from '@elastic/eui';
// import { FilterButton } from '../filter_button';
// import './index.css'

export const SearchBar = () => {
  const [isClearable, setIsClearable] = useState(true);
  const [value, setValue] = useState('');

  const onChange = (e: any) => {
    setValue(e.target.value);
  };

  return (
    /* DisplayToggles wrapper for Docs only */
    <div>
      <div>
        <EuiFieldSearch
          placeholder="Search by name or ID"
          value={value}
          onChange={(e) => onChange(e)}
          isClearable={isClearable}
          aria-label="Use aria labels when no actual label is in use"
          fullWidth
        />
      </div>
    </div>
  );
};
