import React, { useCallback, useState } from 'react';
import {
    EuiFormRow,
    EuiFilePicker,
    EuiText,
} from '@elastic/eui';

import { parseFile } from '../../../../public/utils'

type Props = {
    updateParsedData: React.Dispatch<React.SetStateAction<{
        data: never[];
    }>>
}

export const UploadFile = ({ updateParsedData }: Props) => {

    const [uploadFiles, setUploadFiles] = useState([{}])
    const renderFiles = useCallback(() => {
        if (uploadFiles.length > 0) {
            return (
                <ul>
                    {uploadFiles.map((file, index) => (
                        <li key={index}>
                            <strong>{file.name}</strong> ({file.size} bytes)
                        </li>
                    ))}
                </ul>
            );
        } else {
            return (
                <p>Add some files to see a demo of retrieving from the FileList</p>
            );
        }
    }, [uploadFiles]);

    const handleUplpodFile = (files: FileList | null) => {
        if (!files) return
        setUploadFiles(files.length > 0 ? Array.from(files) : []);
        updateParsedData({
            data: []
        })
        if (files[0]) {
            parseFile(files[0], (data) => {
                updateParsedData(data);
            })
        }

    };

    return (
        <>
            <EuiFormRow label="File picker" fullWidth>
                <EuiFilePicker
                    initialPromptText="upload CSV or JSON data"
                    display='large'
                    onChange={handleUplpodFile}
                    fullWidth
                />
            </EuiFormRow>
            <EuiText>
                <h5>Files attached</h5>
                {renderFiles()}
            </EuiText>
        </>
    )
}