/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { createSHA256 } from 'hash-wasm';

const readChunkFile = (chunk: Blob) => {
  return new Promise<Uint8Array>((resolve) => {
    const fileReader = new FileReader();
    fileReader.onload = async (e) => {
      if (e.target?.result) {
        resolve(new Uint8Array(e.target.result as ArrayBuffer));
      }
    };
    fileReader.readAsArrayBuffer(chunk);
  });
};

export const getModelContentHashValue = async (file: Blob) => {
  const hasher = await createSHA256();
  const chunkSize = 64 * 1024 * 1024;

  const chunkNumber = Math.floor(file.size / chunkSize);

  for (let i = 0; i <= chunkNumber; i++) {
    const chunk = file.slice(chunkSize * i, Math.min(chunkSize * (i + 1), file.size));
    hasher.update(await readChunkFile(chunk));
  }

  return hasher.digest();
};
