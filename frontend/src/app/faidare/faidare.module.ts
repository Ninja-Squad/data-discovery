import { NgModule } from '@angular/core';

import { UrgiCommonModule } from '../urgi-common/urgi-common.module';
import { GenericDocumentComponent } from '../urgi-common/generic-document/generic-document.component';
import { FaidareHeaderComponent } from './faidare-header/faidare-header.component';
import { GenericSelectAllResultsComponent } from '../urgi-common/generic-select-all-results/generic-select-all-results.component';
import { TreeComponent } from './tree/tree.component';
import { NodeComponent } from './tree/node/node.component';
import { ReactiveFormsModule } from '@angular/forms';
import { DataDiscoveryNgbModule } from '../data-discovery-ngb.module';

@NgModule({
  imports: [UrgiCommonModule, ReactiveFormsModule, DataDiscoveryNgbModule],
  declarations: [FaidareHeaderComponent, TreeComponent, NodeComponent],
  exports: [
    GenericDocumentComponent,
    GenericSelectAllResultsComponent,
    FaidareHeaderComponent,
    TreeComponent
  ]
})
export class FaidareModule {}
