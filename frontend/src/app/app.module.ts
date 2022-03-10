import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HTTP_INTERCEPTORS, HttpClient, HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';

import { routes } from './app.routes';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { SearchComponent } from './search/search.component';
import { DocumentsComponent } from './documents/documents.component';
import { AggregationsComponent } from './aggregations/aggregations.component';
import { SmallAggregationComponent } from './small-aggregation/small-aggregation.component';
import { LargeAggregationComponent } from './large-aggregation/large-aggregation.component';
import { PillarsComponent } from './pillars/pillars.component';
import { AggregationNamePipe } from './aggregation-name.pipe';
import { DocumentCountComponent } from './document-count/document-count.component';
import { ErrorComponent } from './error/error.component';
import { ErrorInterceptorService } from './error-interceptor.service';
import { NavbarComponent } from './navbar/navbar.component';
import { environment } from '../environments/environment';
import { LoadingSkeletonComponent } from './loading-skeleton/loading-skeleton.component';
import { MarkdownModule, MarkedOptions, MarkedRenderer } from 'ngx-markdown';
import { MarkdownPageComponent } from './markdown-page/markdown-page.component';
import { DescendantsCheckboxComponent } from './descendants-checkbox/descendants-checkbox.component';
import { I18nModule } from './i18n/i18n.module';
import { DataDiscoveryNgbModule } from './data-discovery-ngb.module';

registerLocaleData(localeFr);

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    SearchComponent,
    DocumentsComponent,
    AggregationsComponent,
    SmallAggregationComponent,
    LargeAggregationComponent,
    PillarsComponent,
    AggregationNamePipe,
    DocumentCountComponent,
    ErrorComponent,
    NavbarComponent,
    LoadingSkeletonComponent,
    MarkdownPageComponent,
    DescendantsCheckboxComponent
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot(routes, {
      scrollPositionRestoration: 'disabled', // when enabled, every click on an aggregation scrolls the page to the top, which is annoying
      anchorScrolling: 'enabled'
    }),
    ReactiveFormsModule,
    DataDiscoveryNgbModule,
    HttpClientModule,
    MarkdownModule.forRoot({
      loader: HttpClient, // optional, only if you use [src] attribute
      markedOptions: {
        provide: MarkedOptions,
        useFactory: markedOptionsFactory,
        useValue: {
          gfm: true, // default
          tables: true,
          breaks: false,
          pedantic: false,
          sanitize: false,
          smartLists: true,
          smartypants: false
        }
      }
    }),
    I18nModule,
    // the appropriate resource module depending on the `resourceModule` configured in the environment
    // each of the possible modules contains a component with a selector `dd-document`
    // able to display the genetic resource of the application
    environment.resourceModule
  ],
  providers: [{ provide: HTTP_INTERCEPTORS, useExisting: ErrorInterceptorService, multi: true }],
  bootstrap: [AppComponent],
  exports: [RouterModule]
})
export class AppModule {}

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
    renderer: renderer
  };
}
