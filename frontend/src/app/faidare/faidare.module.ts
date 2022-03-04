import { NgModule } from '@angular/core';
import { GenericDocumentComponent } from '../urgi-common/generic-document/generic-document.component';
import { FaidareHeaderComponent } from './faidare-header/faidare-header.component';
import { GenericSelectAllResultsComponent } from '../urgi-common/generic-select-all-results/generic-select-all-results.component';
import { TreeComponent } from './tree/tree.component';
import { NodeComponent } from './tree/node/node.component';
import { ReactiveFormsModule } from '@angular/forms';
import { DataDiscoveryNgbModule } from '../data-discovery-ngb.module';
import { FaidareOntologyAggregationComponent } from './faidare-ontology-aggregation/faidare-ontology-aggregation.component';
import { OntologyAggregationModalComponent } from './ontology-aggregation-modal/ontology-aggregation-modal.component';
import { TranslateModule } from '@ngx-translate/core';
import { NodeDetailsComponent } from './node-details/node-details.component';
import { OntologyNodeTypeComponent } from './ontology-node-type/ontology-node-type.component';
import { FaidareFooterComponent } from './faidare-footer/faidare-footer.component';
import { GermplasmResultsComponent } from './germplasm-results/germplasm-results.component';
import { FaidareDocumentListComponent } from './faidare-document-list/faidare-document-list.component';
import { SortableHeaderComponent } from './germplasm-results/sortable-header/sortable-header.component';
import { CommonModule } from '@angular/common';
import { TruncatableDescriptionComponent } from '../truncatable-description/truncatable-description.component';
import { GenericRareBasketComponent } from '../urgi-common/generic-rare-basket/generic-rare-basket.component';

@NgModule({
  imports: [CommonModule, ReactiveFormsModule, DataDiscoveryNgbModule, TranslateModule],
  declarations: [
    GenericDocumentComponent,
    GenericSelectAllResultsComponent,
    TruncatableDescriptionComponent,
    FaidareHeaderComponent,
    TreeComponent,
    NodeComponent,
    FaidareOntologyAggregationComponent,
    OntologyAggregationModalComponent,
    NodeDetailsComponent,
    OntologyNodeTypeComponent,
    FaidareFooterComponent,
    GermplasmResultsComponent,
    FaidareDocumentListComponent,
    SortableHeaderComponent,
    GenericRareBasketComponent
  ],
  exports: [
    GenericSelectAllResultsComponent,
    FaidareHeaderComponent,
    FaidareFooterComponent,
    FaidareOntologyAggregationComponent,
    FaidareDocumentListComponent,
    GenericRareBasketComponent
  ]
})
export class FaidareModule {}
