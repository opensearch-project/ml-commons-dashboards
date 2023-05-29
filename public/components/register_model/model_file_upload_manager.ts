/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { BehaviorSubject, Observable, range } from 'rxjs';
import { concatMap } from 'rxjs/operators';

import { APIProvider } from '../../apis/api_provider';

interface FileUploadStatus {
  current: number;
  total: number;
}

interface UploadOptions {
  file: File;
  chunkSize: number;
  modelId: string;
  onUpdate?: (status: FileUploadStatus) => void;
  onError?: () => void;
  onComplete?: (modelId: string) => void;
}

const MIN_CHUNK_SIZE = 10 * 1000 * 1000;

export class ModelFileUploadManager {
  uploads = new BehaviorSubject<Array<Observable<FileUploadStatus>>>([]);

  constructor() {}

  upload(options: UploadOptions) {
    const chunkSize = options.chunkSize < MIN_CHUNK_SIZE ? MIN_CHUNK_SIZE : options.chunkSize;
    const totalChunks = Math.ceil(options.file.size / chunkSize);

    const observable = range(1, totalChunks).pipe(
      concatMap(async (i) => {
        const chunk = options.file.slice(
          chunkSize * (i - 1),
          Math.min(chunkSize * i, options.file.size)
        );
        await APIProvider.getAPI('modelVersion').uploadChunk(options.modelId, `${i - 1}`, chunk);
        return { total: totalChunks, current: i };
      })
    );

    this.uploads.next(this.uploads.getValue().concat(observable));

    observable.subscribe({
      next: (v) => {
        if (options.onUpdate) {
          options.onUpdate(v);
        }
      },
      error: () => {
        this.uploads.next(this.uploads.getValue().filter((obs) => obs !== observable));

        if (options.onError) {
          options.onError();
        }
      },
      complete: () => {
        this.uploads.next(this.uploads.getValue().filter((obs) => obs !== observable));

        if (options.onComplete) {
          options.onComplete(options.modelId);
        }
      },
    });
  }

  /**
   * Get the running uploads
   */
  getUploads$() {
    return this.uploads.asObservable();
  }
}

export const modelFileUploadManager = new ModelFileUploadManager();

window.onbeforeunload = () => {
  if (modelFileUploadManager.uploads.getValue().length > 0) {
    return 'File upload will be terminated if you leave the page, are you sure?';
  }
};
