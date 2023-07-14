import { MarkedOptions, MarkedRenderer } from 'ngx-markdown';

export function markedOptionsFactory(): MarkedOptions {
  const renderer = new MarkedRenderer();

  renderer.link = (href: string, title: string, text: string) => {
    if (href.startsWith('#')) {
      const fragment = href.split('#')[1];
      return `<a href='${location.pathname}#${fragment}'>${text}</a>`;
    }
    return `<a href="${href}" target="_blank" >${text}</a>`;
  };
  return {
    renderer
  };
}
