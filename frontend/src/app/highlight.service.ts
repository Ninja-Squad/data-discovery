import { Injectable } from '@angular/core';

interface Boundaries {
  startIndex: number;
  endIndex: number;
}

@Injectable({
  providedIn: 'root'
})
export class HighlightService {
  /**
   * Truncates highlighted text (i.e. text containing words highlighted with `<em>word</em>`) so that it's at most
   * `maxLength` printable characters long.
   *
   * If the first highlighted node is after the given `maxLength` index, then the beginning is truncated so that the
   * first highlighted node is displayed, with some context around.
   *
   * @param highlightedText the highlighted text, which normally contains <em> elements
   * @param contextLength the length of the countext around the first displayed <em> element (including the text
   * of the <em> element itself)
   */
  truncate(highlightedText: string, maxLength: number, contextLength: number): string {
    if (!highlightedText) {
      return highlightedText;
    }

    const span = document.createElement('span');
    span.innerHTML = highlightedText;
    span.normalize(); // to make sure there is no empty text node and no two adjacent text nodes

    const boundaries = this.boundariesOfFirstHighlightedText(span);

    if (!boundaries || boundaries.startIndex === 0 || boundaries.endIndex <= maxLength) {
      return this.simpleTruncate(span, maxLength);
    }
    else {
      return this.innerTruncate(span, maxLength, contextLength);
    }
  }

  private simpleTruncate(span: HTMLElement, maxLength: number): string {
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

  private innerTruncate(span: HTMLElement, maxLength: number, contextLength: number): string {
    // we know that the first highlighted node (i.e. <em> element) is after maxLength
    // and that the first child node of the span is thus a text node, and the second child node of the span
    // is the first highlighted node, since the span is normalized

    const totalLength = span.textContent.length;
    const firstTextNode = span.childNodes[0];
    const firstHighlightedNode = span.childNodes[1];

    // The remaining context length is the number of characters to add before the <em> and after the </em>
    let remainingContextLength = contextLength - firstHighlightedNode.textContent.length;
    if (remainingContextLength < 0) {
      // that shouldn't happen, expect if the content of the highlighted node is really really large: larger than the
      // context length. In that case, we enlarge the context.
      contextLength = firstHighlightedNode.textContent.length;
      remainingContextLength = 0;
    }

    // split the remaining context length in half, unless there is not enough space at the end
    const trailingLength = Math.min(remainingContextLength / 2, totalLength - (firstTextNode.textContent.length + firstHighlightedNode.textContent.length));
    const beginningLength = remainingContextLength - trailingLength;

    // we will generate a new span and append the various elements.
    const resultSpan = document.createElement('span');

    resultSpan.appendChild(document.createTextNode(firstTextNode.textContent.substring(0, Math.max(0, maxLength - contextLength))));
    const ellipsesElement = document.createElement('i');
    ellipsesElement.appendChild(document.createTextNode(' [...] '));
    resultSpan.appendChild(ellipsesElement);
    resultSpan.appendChild(document.createTextNode(firstTextNode.textContent.substring(firstTextNode.textContent.length - beginningLength)));

    let length = beginningLength;
    for (let i = 1; i < span.childNodes.length && length < contextLength; i++) {
      const remainingLength = contextLength - length;
      const childNode = span.childNodes[i].cloneNode(true);
      const textContent = childNode.textContent;
      if (textContent.length > remainingLength) {
        childNode.textContent = textContent.substring(0, remainingLength);
        length += remainingLength;
      } else {
        length += textContent.length;
      }
      resultSpan.appendChild(childNode);
    }

    return resultSpan.innerHTML;
  }

  private boundariesOfFirstHighlightedText(span: HTMLSpanElement): Boundaries {
    let index = 0;
    for (let i = 0; i < span.childNodes.length; i++) {
      const childNode = span.childNodes[i];
      if (childNode instanceof HTMLElement) {
        return { startIndex: index, endIndex: index + childNode.textContent.length };
      }
      else {
        index += childNode.textContent.length;
      }
    }
    return null;
  }
}
