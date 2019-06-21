import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LOCALE_ID, NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HTTP_INTERCEPTORS, HttpClient, HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import { NgbModule, NgbPaginationModule, NgbTooltipModule, NgbTypeaheadModule } from '@ng-bootstrap/ng-bootstrap';

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
import { LoadingSpinnerComponent } from './loading-spinner/loading-spinner.component';
import { MarkdownModule, MarkedOptions, MarkedRenderer } from 'ngx-markdown';
import { MarkdownPageComponent } from "./markdown-page/markdown-page.component";

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
    LoadingSpinnerComponent,
    MarkdownPageComponent
  ],
  imports: [
    BrowserAnimationsModule,
    BrowserModule,
    RouterModule.forRoot(routes, {
      scrollPositionRestoration: 'enabled',
      anchorScrolling: 'enabled',
    }),
    ReactiveFormsModule,
    HttpClientModule,
    NgbPaginationModule,
    NgbTypeaheadModule,
    NgbTooltipModule,
    NgbModule,
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
        },
      }
    }),
    // the appropriate resource module depending on the `resourceModule` configured in the environment
    // each of the possible modules contains a component with a selector `dd-document`
    // able to display the genetic resource of the application
    environment.resourceModule
  ],
  providers: [
    {provide: LOCALE_ID, useValue: 'fr-FR'},
    {provide: HTTP_INTERCEPTORS, useExisting: ErrorInterceptorService, multi: true}
  ],
  bootstrap: [AppComponent],
  exports: [RouterModule]
})
export class AppModule {
}

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
