import { NgModule } from '@angular/core';

import { UrgiCommonModule } from '../urgi-common/urgi-common.module';
import { GenericDocumentComponent } from '../urgi-common/generic-document/generic-document.component';
import { DataDiscoveryHeaderComponent } from './data-discovery-header/data-discovery-header.component';
import { GenericSelectAllResultsComponent } from '../urgi-common/generic-select-all-results/generic-select-all-results.component';

@NgModule({
  imports: [UrgiCommonModule],
  declarations: [DataDiscoveryHeaderComponent],
  exports: [
    GenericDocumentComponent,
    GenericSelectAllResultsComponent,
    DataDiscoveryHeaderComponent
  ]
})
export class DataDiscoveryModule {}
