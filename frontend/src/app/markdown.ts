import { HttpClient } from '@angular/common/http';
import { MARKED_OPTIONS, MarkedOptions, provideMarkdown } from 'ngx-markdown';

const markedOptions: MarkedOptions = {
  gfm: true,
  breaks: false,
  pedantic: false
};

export function provideConfiguredMarkdown() {
  return provideMarkdown({
    loader: HttpClient,
    markedOptions: {
      provide: MARKED_OPTIONS,
      useValue: markedOptions
    }
  });
}
