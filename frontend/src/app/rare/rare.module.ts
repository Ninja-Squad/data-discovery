import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { NgbModalModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { RareDocumentComponent } from './rare-document/rare-document.component';
import { RareHeaderComponent } from './rare-header/rare-header.component';
import { BasketComponent } from '../urgi-common/basket/basket/basket.component';
import { I18nModule } from '../i18n/i18n.module';
import { GenericDocumentListComponent } from '../urgi-common/generic-document-list/generic-document-list.component';
import { TruncatableDescriptionComponent } from '../truncatable-description/truncatable-description.component';
import { GenericOntologyAggregationComponent } from '../urgi-common/generic-ontology-aggregation/generic-ontology-aggregation.component';
import { GenericFooterComponent } from '../urgi-common/generic-footer/generic-footer.component';
import { SelectAllResultsComponent } from '../urgi-common/basket/select-all-results/select-all-results.component';

@NgModule({
  imports: [CommonModule, ReactiveFormsModule, NgbTooltipModule, NgbModalModule, I18nModule],
  declarations: [
    RareDocumentComponent,
    RareHeaderComponent,
    BasketComponent,
    SelectAllResultsComponent,
    GenericDocumentListComponent,
    TruncatableDescriptionComponent,
    GenericOntologyAggregationComponent,
    GenericFooterComponent
  ],
  exports: [
    RareHeaderComponent,
    BasketComponent,
    SelectAllResultsComponent,
    GenericDocumentListComponent,
    GenericOntologyAggregationComponent,
    GenericFooterComponent
  ]
})
export class RareModule {}
