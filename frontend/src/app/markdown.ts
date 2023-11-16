import { MARKED_OPTIONS, MarkedOptions, provideMarkdown } from 'ngx-markdown';
import { HttpClient } from '@angular/common/http';
import { EnvironmentProviders } from '@angular/core';

const markedOptions: MarkedOptions = {
  gfm: true,
  breaks: false,
  pedantic: false
};

export function provideConfiguredMarkdown(): EnvironmentProviders {
  return provideMarkdown({
    loader: HttpClient,
    markedOptions: {
      provide: MARKED_OPTIONS,
      useValue: markedOptions
    }
  });
}
