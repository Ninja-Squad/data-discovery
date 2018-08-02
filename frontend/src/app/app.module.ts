import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LOCALE_ID, NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import { NgbPaginationModule, NgbTypeaheadModule } from '@ng-bootstrap/ng-bootstrap';

import { routes } from './app.routes';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { SearchComponent } from './search/search.component';
import { GeneticResourcesComponent } from './genetic-resources/genetic-resources.component';
import { GeneticResourceComponent } from './genetic-resource/genetic-resource.component';
import { AggregationsComponent } from './aggregations/aggregations.component';
import { AggregationComponent } from './aggregation/aggregation.component';
import { PillarsComponent } from './pillars/pillars.component';
import { AggregationNamePipe } from './aggregation-name.pipe';
import { DocumentCountComponent } from './document-count/document-count.component';

registerLocaleData(localeFr);

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    SearchComponent,
    GeneticResourcesComponent,
    GeneticResourceComponent,
    AggregationsComponent,
    AggregationComponent,
    PillarsComponent,
    AggregationNamePipe,
    DocumentCountComponent
  ],
  imports: [
    BrowserAnimationsModule,
    BrowserModule,
    RouterModule.forRoot(routes, {
      scrollPositionRestoration: 'disabled'
    }),
    ReactiveFormsModule,
    HttpClientModule,
    NgbPaginationModule.forRoot(),
    NgbTypeaheadModule.forRoot()
  ],
  providers: [
    { provide: LOCALE_ID, useValue: 'fr-FR' }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
