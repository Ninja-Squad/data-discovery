import { inject, Injectable } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class DownloadService {
  private document: Document = inject(DOCUMENT);

  download(blob: Blob, fileName: string) {
    const invisibleLink = document.createElement('a');
    invisibleLink.download = fileName;
    const downloadUrl = URL.createObjectURL(blob);
    invisibleLink.href = downloadUrl;
    invisibleLink.click();

    URL.revokeObjectURL(downloadUrl);
  }
}
