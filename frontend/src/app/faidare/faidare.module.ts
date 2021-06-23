import { NgModule } from '@angular/core';

import { UrgiCommonModule } from '../urgi-common/urgi-common.module';
import { GenericDocumentComponent } from '../urgi-common/generic-document/generic-document.component';
import { FaidareHeaderComponent } from './faidare-header/faidare-header.component';
import { GenericSelectAllResultsComponent } from '../urgi-common/generic-select-all-results/generic-select-all-results.component';

@NgModule({
  imports: [UrgiCommonModule],
  declarations: [FaidareHeaderComponent],
  exports: [GenericDocumentComponent, GenericSelectAllResultsComponent, FaidareHeaderComponent]
})
export class FaidareModule {}
