import { HighlightService } from './highlight.service';

describe('HighlightService', () => {
  it('should truncate', () => {
    const service = new HighlightService();

    const text = 'hello <em>great </em><em>great</em> &amp;big <em>world</em>!'; // 29 printable characters
    expect(service.truncate(null, 10)).toBeNull();

    expect(service.truncate(text, 34)).toBe(text);
    expect(service.truncate(text, 29)).toBe(text);
    expect(service.truncate(text, 28)).toBe('hello <em>great </em><em>great</em> &amp;big <em>world</em>');
    expect(service.truncate(text, 27)).toBe('hello <em>great </em><em>great</em> &amp;big <em>worl</em>');
    expect(service.truncate(text, 26)).toBe('hello <em>great </em><em>great</em> &amp;big <em>wor</em>');
    expect(service.truncate(text, 25)).toBe('hello <em>great </em><em>great</em> &amp;big <em>wo</em>');
    expect(service.truncate(text, 24)).toBe('hello <em>great </em><em>great</em> &amp;big <em>w</em>');
    expect(service.truncate(text, 23)).toBe('hello <em>great </em><em>great</em> &amp;big ');
    expect(service.truncate(text, 22)).toBe('hello <em>great </em><em>great</em> &amp;big');
    expect(service.truncate(text, 21)).toBe('hello <em>great </em><em>great</em> &amp;bi');
    expect(service.truncate(text, 20)).toBe('hello <em>great </em><em>great</em> &amp;b');
    expect(service.truncate(text, 19)).toBe('hello <em>great </em><em>great</em> &amp;');
    expect(service.truncate(text, 18)).toBe('hello <em>great </em><em>great</em> ');
    expect(service.truncate(text, 17)).toBe('hello <em>great </em><em>great</em>');
    expect(service.truncate(text, 16)).toBe('hello <em>great </em><em>grea</em>');
    expect(service.truncate(text, 15)).toBe('hello <em>great </em><em>gre</em>');
    expect(service.truncate(text, 14)).toBe('hello <em>great </em><em>gr</em>');
    expect(service.truncate(text, 13)).toBe('hello <em>great </em><em>g</em>');
    expect(service.truncate(text, 12)).toBe('hello <em>great </em>');
    expect(service.truncate(text, 11)).toBe('hello <em>great</em>');
    expect(service.truncate(text, 10)).toBe('hello <em>grea</em>');
    expect(service.truncate(text, 9)).toBe('hello <em>gre</em>');
    expect(service.truncate(text, 8)).toBe('hello <em>gr</em>');
    expect(service.truncate(text, 7)).toBe('hello <em>g</em>');
    expect(service.truncate(text, 6)).toBe('hello ');
    expect(service.truncate(text, 5)).toBe('hello');
    expect(service.truncate(text, 4)).toBe('hell');

    const desc = Array(200).fill('aaa').join(' ');
    expect(service.truncate(desc, 256).length).toBe(256);
  });
});
