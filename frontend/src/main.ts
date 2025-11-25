import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';
import { provideRouter, withInMemoryScrolling, withViewTransitions } from '@angular/router';
import { bootstrapApplication } from '@angular/platform-browser';
import { errorInterceptor } from './app/error-interceptor.service';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideI18n } from './app/i18n/i18n';
import { provideConfiguredMarkdown } from './app/markdown';
import { environment } from './environments/environment';

bootstrapApplication(AppComponent, {
  providers: [
    provideConfiguredMarkdown(),
    provideRouter(
      routes,
      withInMemoryScrolling({
        // when enabled, every click on an aggregation scrolls the page to the top, which is annoying
        scrollPositionRestoration: 'disabled',
        anchorScrolling: 'enabled'
      }),
      withViewTransitions({ skipInitialTransition: true })
    ),
    provideHttpClient(withInterceptors([errorInterceptor])),
    provideI18n(),
    [...(environment.providers ?? [])]
  ]
})
  // eslint-disable-next-line no-console
  .catch(err => console.error(err));
