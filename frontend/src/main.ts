import { importProvidersFrom } from '@angular/core';
import { AppComponent } from './app/app.component';
import { MarkdownModule, MarkedOptions } from 'ngx-markdown';
import { routes } from './app/app.routes';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { bootstrapApplication } from '@angular/platform-browser';
import { errorInterceptor } from './app/error-interceptor.service';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { markedOptionsFactory } from './marked-options.factory';
import { provideI18n } from './app/i18n/i18n';

bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(
      MarkdownModule.forRoot({
        loader: HttpClient,
        markedOptions: {
          provide: MarkedOptions,
          useFactory: markedOptionsFactory,
          useValue: {
            gfm: true,
            tables: true,
            breaks: false,
            pedantic: false,
            sanitize: false,
            smartLists: true,
            smartypants: false
          }
        }
      })
    ),
    provideRouter(
      routes,
      withInMemoryScrolling({
        // when enabled, every click on an aggregation scrolls the page to the top, which is annoying
        scrollPositionRestoration: 'disabled',
        anchorScrolling: 'enabled'
      })
    ),
    provideHttpClient(withInterceptors([errorInterceptor])),
    provideI18n()
  ]
})
  // eslint-disable-next-line no-console
  .catch(err => console.error(err));
