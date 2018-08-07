import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class HighlightService {
  /**
   * Truncates highlighted text (i.e. text containing words highlighted with `<em>word</em>` so that it's at most
   * `maxLength` printable characters long.
   */
  truncate(highlightedText: string, maxLength: number): string {
    if (!highlightedText) {
      return highlightedText;
    }

    const span = document.createElement('span');
    span.innerHTML = highlightedText;

    let length = 0;
    let i: number;
    for (i = 0; i < span.childNodes.length && length < maxLength; i++) {
      const remainingLength = maxLength - length;
      const childNode = span.childNodes[i];
      const textContent = childNode.textContent;
      if (textContent.length > remainingLength) {
        childNode.textContent = textContent.substring(0, remainingLength);
        length += remainingLength;
      } else {
        length += textContent.length;
      }
    }
    for (let j = span.childNodes.length - 1; j >= i; j--) {
      span.removeChild(span.childNodes[j]);
    }

    return span.innerHTML;
  }
}
