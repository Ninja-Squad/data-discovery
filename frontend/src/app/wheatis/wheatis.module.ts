import { NgModule } from '@angular/core';
import { GenericDocumentComponent } from '../urgi-common/generic-document/generic-document.component';
import { WheatisHeaderComponent } from './wheatis-header/wheatis-header.component';
import { GenericSelectAllResultsComponent } from '../urgi-common/generic-select-all-results/generic-select-all-results.component';
import { CommonModule } from '@angular/common';
import { TruncatableDescriptionComponent } from '../truncatable-description/truncatable-description.component';
import { GenericDocumentListComponent } from '../generic-document-list/generic-document-list.component';
import { GenericFooterComponent } from '../urgi-common/generic-footer/generic-footer.component';
import { GenericOntologyAggregationComponent } from '../urgi-common/generic-ontology-aggregation/generic-ontology-aggregation.component';
import { GenericRareBasketComponent } from '../urgi-common/generic-rare-basket/generic-rare-basket.component';

@NgModule({
  imports: [CommonModule],
  declarations: [
    WheatisHeaderComponent,
    GenericDocumentComponent,
    GenericSelectAllResultsComponent,
    TruncatableDescriptionComponent,
    GenericDocumentListComponent,
    GenericFooterComponent,
    GenericOntologyAggregationComponent,
    GenericRareBasketComponent
  ],
  exports: [
    GenericSelectAllResultsComponent,
    WheatisHeaderComponent,
    GenericDocumentListComponent,
    GenericFooterComponent,
    GenericOntologyAggregationComponent,
    GenericRareBasketComponent
  ]
})
export class WheatisModule {}
