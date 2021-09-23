import { NgModule } from '@angular/core';

import { UrgiCommonModule } from '../urgi-common/urgi-common.module';
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

@NgModule({
  imports: [UrgiCommonModule, ReactiveFormsModule, DataDiscoveryNgbModule, TranslateModule],
  declarations: [
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
    SortableHeaderComponent
  ],
  exports: [
    GenericDocumentComponent,
    GenericSelectAllResultsComponent,
    FaidareHeaderComponent,
    FaidareFooterComponent,
    FaidareOntologyAggregationComponent,
    FaidareDocumentListComponent
  ]
})
export class FaidareModule {}
