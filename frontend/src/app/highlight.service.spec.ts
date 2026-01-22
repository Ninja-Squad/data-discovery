import { describe, expect, test } from 'vitest';

import { HighlightService } from './highlight.service';

describe('HighlightService', () => {
  test('should truncate', () => {
    const service = new HighlightService();

    const text = 'hello <em>great </em><em>great</em> &amp;big <em>world</em>!'; // 29 printable characters
    expect(service.truncate(null, 256, 100)).toBeNull();

    expect(service.truncate(text, 34, 10)).toBe(text);
    expect(service.truncate(text, 29, 10)).toBe(text);
    expect(service.truncate(text, 28, 10)).toBe(
      'hello <em>great </em><em>great</em> &amp;big <em>world</em>'
    );
    expect(service.truncate(text, 27, 10)).toBe(
      'hello <em>great </em><em>great</em> &amp;big <em>worl</em>'
    );
    expect(service.truncate(text, 26, 10)).toBe(
      'hello <em>great </em><em>great</em> &amp;big <em>wor</em>'
    );
    expect(service.truncate(text, 25, 10)).toBe(
      'hello <em>great </em><em>great</em> &amp;big <em>wo</em>'
    );
    expect(service.truncate(text, 24, 10)).toBe(
      'hello <em>great </em><em>great</em> &amp;big <em>w</em>'
    );
    expect(service.truncate(text, 23, 10)).toBe('hello <em>great </em><em>great</em> &amp;big ');
    expect(service.truncate(text, 22, 10)).toBe('hello <em>great </em><em>great</em> &amp;big');
    expect(service.truncate(text, 21, 10)).toBe('hello <em>great </em><em>great</em> &amp;bi');
    expect(service.truncate(text, 20, 10)).toBe('hello <em>great </em><em>great</em> &amp;b');
    expect(service.truncate(text, 19, 10)).toBe('hello <em>great </em><em>great</em> &amp;');
    expect(service.truncate(text, 18, 10)).toBe('hello <em>great </em><em>great</em> ');
    expect(service.truncate(text, 17, 10)).toBe('hello <em>great </em><em>great</em>');
    expect(service.truncate(text, 16, 10)).toBe('hello <em>great </em><em>grea</em>');
    expect(service.truncate(text, 15, 10)).toBe('hello <em>great </em><em>gre</em>');
    expect(service.truncate(text, 14, 10)).toBe('hello <em>great </em><em>gr</em>');
    expect(service.truncate(text, 13, 10)).toBe('hello <em>great </em><em>g</em>');
    expect(service.truncate(text, 12, 10)).toBe('hello <em>great </em>');
    expect(service.truncate(text, 11, 10)).toBe('h<i> [...] </i>o <em>great </em><em>gr</em>');

    const text2 =
      'lorem ipsum blabla text hello <em>great</em> <em>great</em> &amp;big <em>world</em>!';
    expect(service.truncate(text2, 30, 15)).toBe(
      'lorem ipsum bla<i> [...] </i>ello <em>great</em> <em>grea</em>'
    );

    const text3 = 'lorem ipsum blabla blabla blabla text hello <em>great</em> !';
    expect(service.truncate(text3, 30, 15)).toBe(
      'lorem ipsum bla<i> [...] </i>t hello <em>great</em> !'
    );

    const desc = Array(200).fill('aaa').join(' ');
    expect(service.truncate(desc, 256, 100).length).toBe(256);
  });
});
