/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useState } from 'react';
import { EuiFormRow, EuiFilePicker, EuiText, EuiSwitch } from '@elastic/eui';

import { parseFile } from '../../../../public/utils';
import { ParsedData } from '../../../types';

interface Props {
  updateParsedData: React.Dispatch<React.SetStateAction<ParsedData>>;
}

export const UploadFile = ({ updateParsedData }: Props) => {
  const [uploadFiles, setUploadFiles] = useState<Array<File>>([]);
  const [ifHeader, setIfHeader] = useState(false);
  const handleChangeIfHeader = useCallback(
    (checked: boolean) => {
      setIfHeader(checked);
      parseFile(uploadFiles[0], checked, (data) => {
        updateParsedData(data);
      });
    },
    [uploadFiles, updateParsedData]
  );

  const renderFiles = useCallback(() => {
    if (uploadFiles.length > 0) {
      return (
        <ul>
          {uploadFiles.map((file, index) => (
            <li key={index}>
              <strong>{file.name}</strong> ({file.size} bytes)
              <EuiSwitch
                label="First row is header"
                checked={ifHeader}
                style={{ paddingLeft: '16px' }}
                compressed
                onChange={(e) => handleChangeIfHeader(e.target.checked)}
              />
            </li>
          ))}
        </ul>
      );
    } else {
      return <p>Add some files to see a demo of retrieving from the FileList</p>;
    }
  }, [uploadFiles, ifHeader, handleChangeIfHeader]);

  const handleUplpodFile = useCallback(
    (files: FileList | null) => {
      if (!files) return;
      setUploadFiles(files.length > 0 ? Array.from(files) : []);
      updateParsedData({
        data: [],
        errors: [],
        meta: { delimiter: '', linebreak: '', aborted: false, truncated: false, cursor: 0 },
      });
      if (files[0]) {
        parseFile(files[0], false, (data) => {
          updateParsedData(data);
        });
      }
    },
    [updateParsedData]
  );

  return (
    <>
      <EuiFormRow label="File picker" fullWidth>
        <EuiFilePicker
          initialPromptText="upload CSV or JSON data"
          display="large"
          onChange={handleUplpodFile}
          fullWidth
        />
      </EuiFormRow>
      <EuiText>
        <h5>Files attached</h5>
        {renderFiles()}
      </EuiText>
    </>
  );
};
