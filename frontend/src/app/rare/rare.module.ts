import { InjectionToken, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { NgbModalModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { RareDocumentComponent } from './rare-document/rare-document.component';
import { RareHeaderComponent } from './rare-header/rare-header.component';
import { RareBasketComponent } from './rare-basket/rare-basket.component';
import { I18nModule } from '../i18n/i18n.module';
import { RareSelectAllResultsComponent } from './rare-select-all-results/rare-select-all-results.component';
import { GenericDocumentListComponent } from '../generic-document-list/generic-document-list.component';
import { TruncatableDescriptionComponent } from '../truncatable-description/truncatable-description.component';
import { GenericOntologyAggregationComponent } from '../urgi-common/generic-ontology-aggregation/generic-ontology-aggregation.component';
import { GenericFooterComponent } from '../urgi-common/generic-footer/generic-footer.component';

export const LOCATION = new InjectionToken<Location>('Location');

@NgModule({
  imports: [CommonModule, ReactiveFormsModule, NgbTooltipModule, NgbModalModule, I18nModule],
  declarations: [
    RareDocumentComponent,
    RareHeaderComponent,
    RareBasketComponent,
    RareSelectAllResultsComponent,
    GenericDocumentListComponent,
    TruncatableDescriptionComponent,
    GenericOntologyAggregationComponent,
    GenericFooterComponent
  ],
  providers: [{ provide: LOCATION, useValue: window.location }],
  exports: [
    RareHeaderComponent,
    RareBasketComponent,
    RareSelectAllResultsComponent,
    GenericDocumentListComponent,
    GenericOntologyAggregationComponent,
    GenericFooterComponent
  ]
})
export class RareModule {}
