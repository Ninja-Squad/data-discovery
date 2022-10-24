import { NgModule } from '@angular/core';
import { GenericDocumentComponent } from '../urgi-common/generic-document/generic-document.component';
import { WheatisHeaderComponent } from './wheatis-header/wheatis-header.component';
import { GenericSelectAllResultsComponent } from '../urgi-common/generic-select-all-results/generic-select-all-results.component';
import { CommonModule } from '@angular/common';
import { TruncatableDescriptionComponent } from '../truncatable-description/truncatable-description.component';
import { GenericDocumentListComponent } from '../urgi-common/generic-document-list/generic-document-list.component';
import { GenericFooterComponent } from '../urgi-common/generic-footer/generic-footer.component';
import { GenericOntologyAggregationComponent } from '../urgi-common/generic-ontology-aggregation/generic-ontology-aggregation.component';
import { GenericBasketComponent } from '../urgi-common/generic-basket/generic-basket.component';

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
    GenericBasketComponent
  ],
  exports: [
    GenericSelectAllResultsComponent,
    WheatisHeaderComponent,
    GenericDocumentListComponent,
    GenericFooterComponent,
    GenericOntologyAggregationComponent,
    GenericBasketComponent
  ]
})
export class WheatisModule {}
